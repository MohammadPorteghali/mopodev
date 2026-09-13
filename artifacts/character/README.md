# Mohammad character — reference-guided Blender study

This is actual editable textured 3D geometry, refined in Blender/bpy from the project's existing `public/head.glb`. It is **not** a new photogrammetric reconstruction or a claim of an exact likeness.

## Deliverables

- `mohammad-character.blend`: source scene, packed textures and primary reference, named surface components, lights, and camera.
- `mohammad-character.glb`: selected character meshes and materials, excluding the studio.
- `mohammad-character.fbx`: selected character meshes with embedded textures.
- `mohammad-character.obj` and `.mtl`: selected character meshes; keep the accompanying PNG textures with these files.
- `reference-vs-model.png`: supplied primary reference at left; revised Blender render at right.
- `comparison-render-v1.png`, `comparison-render-v2.png`, and `comparison-render-v3.png`: iteration history.
- `build_character.py`: reproducible Blender generation/refinement/export script. Run with `CHARACTER_REVISION=3` for the final exports.
- `model-report.json`: mesh inventory and counts.

## Adjustments

Enlarged the eye regions with smooth local vertex deformation; modestly widened the cheeks; reduced excessive material gloss and normal-map strength; separated major surface regions while preserving UV coordinates; welded coincident vertices within components; set a portrait camera and soft studio lighting. After the first render, increased eye adjustment and widened the framing to include the hair silhouette. After the second comparison, widened and lengthened the head and reduced distracting reflections on the eye surface sections.

## Accuracy and editing limitations

The first image governs the target likeness. Other supplied views show variations in head shape, hairstyle, pose, and shirt proportions; they are not a calibrated rigid multi-view scan. The source retains approximate hair mass, facial expression, neck, and shirt geometry. Fine individual hairs, woven fabric fibers, and exact facial contours have not been reconstructed.

The mesh uses inherited triangles, not hand-built quad facial edge loops. Surface components are separated along existing face edges and have open shared boundaries. Eye objects are surface sections, not complete independent eyeballs. This is usable for surface editing and reference study, **not** a completed rig-ready or watertight production character. These are remaining deviations from the requested clean reconstruction.

The 85 mm lens is an artistic estimate, not a recovered camera calibration. No physical dimensions were supplied, so proportions remain in the source's arbitrary units. Hidden surfaces are inherited from the existing source rather than verified against references. The website and its original model have not been replaced.
