/*
 * ============================================================
 *  SKIMMER LIGHT COLLAR  /  v3.0   (Project #1)
 *
 *  A two-piece SNAP-TOGETHER clamp for the ~5" round floating
 *  pool lights. The collar captures the light's brim and widens
 *  its effective OD so it can't get sucked into the skimmer.
 *
 *  TWO PARTS, snap together around the brim:
 *
 *   BOTTOM (cup)  - open-frame wheel: a windowed hub around the
 *                   brim + spokes out to a wide outer ring (the
 *                   "too wide for the skimmer" feature) + one
 *                   snap post per arm, rooted into the hub wall.
 *   TOP (lid)     - a flat ring that sits on the top edge of the
 *                   brim. The posts hook over it and pull it
 *                   down, trapping the 25 mm brim between the lid
 *                   and the cup's shelf.
 *
 *  Center is open top and bottom: the LED shines straight up,
 *  water drains, and the light floats. The hub wall is cut with
 *  gabled windows (45-deg roofs, self-supporting) to shed mass.
 *
 *  v3.0 polish: BOSL2 edge rounding (hub top, lid, posts), a
 *  fillet at the shelf corner, filleted spoke junctions for
 *  strength, and the brim windows.
 *
 *  MEASURED INPUTS (from the sketch)
 *   - light OD    = 110 mm
 *   - brim height = 25 mm
 *
 *  STILL TO MEASURE
 *   - skimmer throat width -> set collar_od ABOVE it (+ ~20 mm).
 *
 *  DEPENDENCY: BOSL2  (~/Documents/OpenSCAD/libraries/BOSL2)
 *  MATERIAL: ASA. Both parts print flat, no support: cup
 *  open-side up, lid either way.
 * ============================================================
 */

include <BOSL2/std.scad>

/* [What to render] */
// assembled = both parts in place (preview); bottom = the cup;
// lid = the top ring; both_flat = both laid out for the plate
part = "bottom"; // [assembled, bottom, lid, both_flat]

/* [Light measurements] */
// Light outer diameter (mm)
light_d = 110;  // [40:1:200]
// Brim height - the vertical wall that gets captured (mm)
brim_h  = 25;   // [8:1:60]

/* [Skimmer / width] */
// Collar outer diameter - MUST exceed the skimmer throat (mm)
collar_od = 225; // [120:1:260]
// Shelf-base thickness - the ledge the light rests on (mm)
flange_h  = 4;   // [2:1:20]

/* [Fit & capture] */
// Radial gap around the brim so it seats cleanly (mm)
clearance  = 0.4; // [0:0.1:1.5]
// Wall thickness of the brim wall and lid ring (mm)
wall       = 4;   // [2:0.5:8]
// How far the bottom shelf laps under the light (mm)
bottom_lip = 5;   // [1:0.5:8]
// How far the lid laps over the top of the brim (mm)
top_lip    = 3;   // [1:0.5:8]
// Lid thickness (mm)
roof       = 4;   // [2:0.5:8]

/* [Open frame] */
// Wheel (rim + spokes) thickness - raise for stiffness, lower to save material (mm)
frame_h   = 2;   // [2:0.5:12]
// Radial width of the outer ring (mm)
rim_w     = 12;  // [6:1:30]
// Number of arms joining the outer ring to the hub
arm_count = 5;   // [3:1:10]
// Arm width, tangential (mm)
arm_w     = 10;  // [4:1:24]

/* [Brim windows] */
// Cut windows into the brim wall to save material
windows   = true;
// Windows per gap between arms (arms always sit on solid ribs)
wins_per_gap = 3; // [1:1:4]
// Window width, tangential (mm)
win_w     = 16;  // [6:1:30]
// Solid band kept above the shelf (mm)
win_base  = 2;   // [2:1:10]
// Solid band kept below the brim top (mm)
win_top   = 3;   // [2:1:10]
// Window corner rounding (mm)
win_round = 2;   // [0:0.5:5]

/* [Snap posts]  (one per arm, rooted into the hub wall) */
// Post radial thickness (mm)
post_t   = 3.5; // [2:0.5:6]
// Post width, tangential (mm)
post_w   = 8;  // [6:1:24]
// Height of the solid root that fuses the post to the wall (mm)
post_root = 2;  // [3:1:18]
// Print gap between post and wall so they don't fuse (mm)
post_gap = 0.6; // [0.3:0.1:1.2]
// How far the hook laps over the lid top (mm)
hook_d   = 3; // [1:0.5:4]
// Hook height (mm)
hook_h   = 2.5; // [1.5:0.5:5]

/* [Polish] */
// Fillet radius at the spoke-to-rim / spoke-to-hub junctions (mm)
fillet   = 4;   // [0:0.5:8]
// 3D edge rounding on hub top, lid, posts (mm)
edge_r   = 1.5; // [0:0.25:4]
// Chamfer easing the outer top edge of the rim (mm)
rim_ease = 3; // [0:0.2:4]

/* [Quality] */
$fn = 160;

/* ---------- derived ---------- */
eps          = 0.05;
cavity_d     = light_d + 2 * clearance;     // bore that hugs the brim
shelf_id     = light_d - 2 * bottom_lip;    // light rests on this ring
lid_id       = light_d - 2 * top_lip;       // open hole through the lid
wall_od      = cavity_d + 2 * wall;         // OD of brim wall + lid ring
shelf_z      = flange_h;                    // top of the cup shelf
brim_top_z   = shelf_z + brim_h;            // top edge of the brim
lid_top_z    = brim_top_z + roof;           // top face of the lid (assembled)
post_inner_r = wall_od / 2 + post_gap;      // inner face of the posts

/* round every 2D corner (concave + convex) with radius r, size-preserving */
module fillet2d(r) { offset(r = r) offset(r = -2 * r) offset(r = r) children(); }

/* ---------- the windowed hub (brim wall + shelf) ---------- */
module hub() {
    difference() {
        cyl(h = brim_top_z, d = wall_od, rounding2 = edge_r, anchor = BOTTOM);
        // open center through the shelf
        down(eps) cyl(h = shelf_z + 2 * eps, d = shelf_id, anchor = BOTTOM);
        // brim cavity above the shelf; rounding1 makes a fillet at the shelf corner
        up(shelf_z) cyl(h = brim_h + shelf_z, d = cavity_d, rounding1 = edge_r, anchor = BOTTOM);
        // gabled windows, placed in the gaps between arms (ribs stay solid under the posts)
        if (windows)
            for (g = [0 : arm_count - 1], w = [0 : wins_per_gap - 1])
                zrot(g * 360 / arm_count + (360 / arm_count) * (w + 1) / (wins_per_gap + 1))
                    window_cutter();
    }
}

/* one window: vertical slot with a 45-deg gable roof (self-supporting) */
module window_cutter() {
    xc    = (cavity_d / 2 + wall_od / 2) / 2;
    depth = wall + 6;                       // through the wall, with margin
    z0    = shelf_z + win_base;
    zt    = brim_top_z - win_top - win_w / 2;
    move([xc, 0, (z0 + zt) / 2])
        cuboid([depth, win_w, zt - z0], rounding = win_round, edges = "Z");
    move([xc, 0, zt])
        prismoid(size1 = [depth, win_w], size2 = [depth, 0.2], h = win_w / 2, anchor = BOTTOM);
}

/* ---------- the open-frame wheel (rim + spokes) ---------- */
module frame_footprint() {
    spoke_in = wall_od / 2 - 1;
    spoke_L  = collar_od / 2 - spoke_in;
    fillet2d(fillet)
        union() {
            // outer ring
            difference() { circle(d = collar_od); circle(d = collar_od - 2 * rim_w); }
            // hub collar (gives the spokes something to fillet into; center stays open)
            difference() { circle(d = wall_od); circle(d = cavity_d); }
            // spokes
            for (i = [0 : arm_count - 1])
                zrot(i * 360 / arm_count)
                    right(spoke_in + spoke_L / 2) square([spoke_L, arm_w], center = true);
        }
}

module frame() {
    ch = min(rim_ease, frame_h * 0.4);
    difference() {
        linear_extrude(frame_h) frame_footprint();
        // ease the outer top edge of the rim
        if (ch > 0)
            rotate_extrude()
                translate([collar_od / 2, frame_h]) rotate(45) square(ch * 1.6, center = true);
    }
}

/* ---------- cantilever snap post ---------- */
module post() {
    wall_r   = wall_od / 2;
    root_in  = wall_r - 2;                       // bite into the hub wall
    root_out = post_inner_r + post_t;            // outer face of the post
    // solid root: fuses the post to the hub wall (and the spoke beneath it)
    move([(root_in + root_out) / 2, 0, post_root / 2])
        cuboid([root_out - root_in, post_w, post_root], rounding = 1, edges = "Z");
    // cantilever shaft above the root (flexes outward, away from the wall)
    move([post_inner_r + post_t / 2, 0, (post_root + lid_top_z) / 2])
        cuboid([post_t, post_w, lid_top_z - post_root], rounding = 0.8, edges = "Z");
    // 45-deg printable ramp from shaft up to the hook tip
    hull() {
        translate([post_inner_r - hook_d, -post_w / 2, lid_top_z])
            cube([hook_d + post_t, post_w, eps]);
        translate([post_inner_r, -post_w / 2, lid_top_z - hook_d])
            cube([post_t, post_w, eps]);
    }
    // the hook that laps over the lid (functional edge kept crisp)
    translate([post_inner_r - hook_d, -post_w / 2, lid_top_z])
        cube([hook_d + post_t, post_w, hook_h]);
}

/* ---------- BOTTOM: the cup ---------- */
module bottom_part() {
    hub();
    frame();
    for (i = [0 : arm_count - 1]) zrot(i * 360 / arm_count) post();
}

/* ---------- TOP: the lid ring ---------- */
module lid_part() {
    // rounded top edges double as the cam-in lead for the snap posts
    tube(h = roof, od = wall_od, id = lid_id, rounding2 = edge_r, anchor = BOTTOM);
}

/* ---------- layouts ---------- */
module assembled() {
    bottom_part();
    color("LightSteelBlue") up(brim_top_z) lid_part();
}

module both_flat() {
    spacing = collar_od / 2 + wall_od / 2 + 14;
    left(spacing)  bottom_part();
    right(spacing) lid_part();
}

if (part == "assembled")  assembled();
else if (part == "bottom") bottom_part();
else if (part == "lid")    lid_part();
else                       both_flat();
