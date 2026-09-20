"""Builds Trundle's animation sheet from the AI-generated pose sheet.

    python3 -m venv .venv && .venv/bin/pip install numpy pillow scipy
    .venv/bin/python scripts/build-trundle-sprites.py

Reads   assets/mascot/source/trundle-walk-sheet.png  (20 poses, checkerboard baked in)
        assets/mascot/trundle-body.png               (only to work out where the face goes)
Writes  assets/mascot/trundle-sheet.png              (aligned frames on a real alpha channel)
        src/components/trundleFrames.ts              (frame table for Trundle.tsx)
        <--preview dir>/preview.png                  (frames with the face drawn on, to eyeball)

What it fixes on the way: removes the fake checkerboard, lines every pose up on the
ground and on his body, and gives the middle poses their leaf back (the source drops
it for twelve frames and then it reappears).
"""
import os
import sys

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE = os.path.join(ROOT, "assets/mascot/source/trundle-walk-sheet.png")
BODY_ART = os.path.join(ROOT, "assets/mascot/trundle-body.png")
OUT_SHEET = os.path.join(ROOT, "assets/mascot/trundle-sheet.png")
OUT_TABLE = os.path.join(ROOT, "src/components/trundleFrames.ts")
PREVIEW_DIR = sys.argv[1] if len(sys.argv) > 1 else None

# Face position in trundle-body.png, from Trundle.tsx.
ART_FACE = (667, 808)
OUTLINE = (23, 25, 26)
UPSCALE = 2
COLUMNS = 5
PAD = 6


def green_mask(rgb):
    r, g, b = (rgb[..., i].astype(int) for i in range(3))
    return (g > r + 20) & (g > b + 35)


def body_anchor(pose, px=1.0):
    """(centre x, top y) of the rock itself, ignoring leaf, arms and legs.

    The top is the first row with rock-grey fill in it (the leaf and stem have none).
    The centre comes from the dome just under it, which is above where the arms attach.
    `px` scales the row distances for the much larger body art.
    """
    rgb, alpha = pose[..., :3].astype(int), pose[..., 3]
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    fill = (alpha > 128) & (abs(r - g) < 14) & (abs(g - b) < 14) & (r > 110)
    top = int(np.argmax(fill.sum(axis=1) >= 6 * px)) - round(3 * px)
    solid = alpha > 128
    centres = []
    for y in range(top + round(10 * px), top + round(45 * px)):
        xs = np.nonzero(solid[y])[0]
        centres.append((xs.min() + xs.max()) / 2)
    return float(np.median(centres)), top


def cut_poses():
    src = Image.open(SOURCE).convert("RGB")
    a = np.asarray(src).astype(int)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]

    # Background = light neutral pixels connected to the border. His dark outline stops
    # the fill, so the light facets inside the rock survive.
    neutral = (abs(r - g) < 12) & (abs(g - b) < 12)
    lab, _ = ndi.label(neutral & (r >= 200))
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(edge))
    # Dust puffs have no outline and would skew the alignment.
    dust = (r > 150) & (r - b > 10) & (g > b) & (r >= g) & (r - g < 40)
    fg = ndi.binary_opening(~bg & ~dust, iterations=2)

    lab2, n = ndi.label(fg)
    sizes = ndi.sum(fg, lab2, range(1, n + 1))
    objs = ndi.find_objects(lab2)
    found = [(objs[i], i + 1) for i in range(n) if sizes[i] > 3000]
    assert len(found) == 20, f"expected 20 poses, found {len(found)}"
    found.sort(key=lambda p: (int((p[0][0].start + p[0][0].stop) / 2 // (src.height / 4)), p[0][1].start))

    poses = []
    for sl, idx in found:
        # Shave a pixel off: the outermost ring is mostly checkerboard.
        mask = ndi.binary_erosion(ndi.binary_fill_holes(lab2[sl] == idx), iterations=1)
        rgb = np.asarray(src)[sl].copy()
        # What's left of the cut edge is a blend of outline and checkerboard. His outline
        # runs all the way round, so anything pale in that ring is halo: repaint it.
        rim = mask & ~ndi.binary_erosion(mask, iterations=2)
        light = rgb.astype(int).sum(-1) > 270
        rgb[rim & light] = OUTLINE
        alpha = ndi.gaussian_filter(mask.astype(float), 0.6)
        alpha = (np.clip((alpha - 0.3) / 0.5, 0, 1) * 255).astype(np.uint8)
        poses.append(np.dstack([rgb, alpha]))
    return poses


def leaf_layer(pose):
    """The leaf and stem from a pose that has them, plus the body anchor they hang off."""
    cx, top = body_anchor(pose)
    rgb = pose[..., :3].astype(int)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    layer = pose[: top + 8].copy()
    # From the rock's top edge down keep only stem and leaf colours, so no stray rock
    # outline gets pasted onto another pose. The layer goes underneath, so the extra
    # stem just hides behind the rock.
    plant = green_mask(pose[..., :3]) | ((r > g) & (g > b) & (r - b > 30))
    keep = np.ones(layer.shape[:2], bool)
    keep[top:] = plant[top : top + 8]
    layer[..., 3] = np.where(keep, layer[..., 3], 0)
    ys, xs = np.nonzero(layer[..., 3])
    x0, y0 = xs.min(), ys.min()
    return layer[y0:, x0 : xs.max() + 1], (cx - x0, top - y0)


def main():
    poses = cut_poses()

    # Pose 0 is the only early pose with a leaf, and its leaf is a different drawing from
    # the later ones. Drop it and give poses 1-12 the leaf from pose 13 instead.
    leaf, leaf_anchor = leaf_layer(poses[13])
    frames = []
    for i in range(1, 20):
        pose = poses[i]
        cx, top = body_anchor(pose)
        if i <= 12:
            dx, dy = round(cx - leaf_anchor[0]), top - leaf_anchor[1]
            grow = max(0, -dy)
            under = Image.new("RGBA", (pose.shape[1], pose.shape[0] + grow), (0, 0, 0, 0))
            under.alpha_composite(Image.fromarray(leaf, "RGBA"), (dx, dy + grow))
            under.alpha_composite(Image.fromarray(pose, "RGBA"), (0, grow))
            pose = np.asarray(under)
            top += grow
        frames.append((pose, (cx, top)))

    # Face offset from the body anchor, measured on the body art and scaled down.
    art = np.asarray(Image.open(BODY_ART).convert("RGBA"))
    art_width = max(np.ptp(np.nonzero(row)[0]) for row in art[..., 3] > 128 if row.any())
    scale = poses[1].shape[1] / art_width
    ax, atop = body_anchor(art, px=1 / scale)
    face_dx, face_dy = (ART_FACE[0] - ax) * scale, (ART_FACE[1] - atop) * scale

    # One cell size for everything: body centre at the cell's centre, feet on its floor.
    half = max(max(a[0], p.shape[1] - a[0]) for p, a in frames)
    cell_w = int(np.ceil(half)) * 2 + PAD * 2
    cell_h = max(p.shape[0] for p, _ in frames) + PAD * 2
    rows = -(-len(frames) // COLUMNS)
    sheet = Image.new("RGBA", (cell_w * COLUMNS, cell_h * rows), (0, 0, 0, 0))
    faces = []
    for i, (pose, (cx, cy)) in enumerate(frames):
        ox = (i % COLUMNS) * cell_w + cell_w // 2 - round(cx)
        oy = (i // COLUMNS) * cell_h + cell_h - PAD - pose.shape[0]
        sheet.alpha_composite(Image.fromarray(pose, "RGBA"), (ox, oy))
        faces.append([cell_w / 2 + (cx - round(cx)) + face_dx, cell_h - PAD - pose.shape[0] + cy + face_dy])

    # The source redraws him slightly differently each pose, so the anchor jitters by a
    # pixel or two. Smooth it within each run of poses.
    faces = np.array(faces)
    smooth = faces.copy()
    for start, end in [(0, 14), (14, 19)]:
        for k in range(start, end):
            lo, hi = max(start, k - 1), min(end, k + 2)
            smooth[k] = faces[lo:hi].mean(axis=0)

    big = sheet.convert("RGBa").resize((sheet.width * UPSCALE, sheet.height * UPSCALE), Image.LANCZOS).convert("RGBA")
    big.save(OUT_SHEET, optimize=True)

    with open(OUT_TABLE, "w", encoding="utf-8") as f:
        f.write("// Generated by scripts/build-trundle-sprites.py. Don't edit by hand.\n\n")
        f.write("// Sheet layout, in source pixels before the 2x upscale.\n")
        f.write(f"export const SHEET = {{ columns: {COLUMNS}, rows: {rows}, cellWidth: {cell_w}, cellHeight: {cell_h} }};\n\n")
        f.write("// Feet sit this far above the bottom of a cell.\n")
        f.write(f"export const FLOOR_INSET = {PAD};\n\n")
        f.write("// Sprite pixels per pixel of trundle-body.png, for sizing the face.\n")
        f.write(f"export const FACE_SCALE = {scale:.5f};\n\n")
        f.write("// Frames 0-13 are him standing up from rest; 14-18 are the walk loop.\n")
        f.write("export const REST_FRAME = 0;\nexport const STAND_END = 13;\nexport const WALK_START = 14;\nexport const WALK_END = 18;\n\n")
        f.write("// Where the middle of his face goes in each frame's cell: [x, y].\n")
        f.write("export const FACE: [number, number][] = [\n")
        for x, y in smooth:
            f.write(f"  [{x:.1f}, {y:.1f}],\n")
        f.write("];\n")

    if PREVIEW_DIR:
        os.makedirs(PREVIEW_DIR, exist_ok=True)
        prev = Image.new("RGBA", sheet.size, (16, 18, 15, 255))
        prev.alpha_composite(sheet)
        d = ImageDraw.Draw(prev)
        for i, (x, y) in enumerate(smooth):
            bx, by = (i % COLUMNS) * cell_w + x, (i // COLUMNS) * cell_h + y
            for ex in (-125, 125):
                d.ellipse([bx + (ex - 30) * scale, by - (43 + 44) * scale, bx + (ex + 30) * scale, by - (43 - 44) * scale], fill=OUTLINE)
            d.arc([bx - 38 * scale, by + 0 * scale, bx + 38 * scale, by + 84 * scale], 20, 160, fill=OUTLINE, width=2)
        prev.save(os.path.join(PREVIEW_DIR, "preview.png"))

    print(f"{len(frames)} frames, cell {cell_w}x{cell_h}, face scale {scale:.4f}")


if __name__ == "__main__":
    main()
