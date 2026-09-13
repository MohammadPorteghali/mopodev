import bpy, json
from pathlib import Path
out=Path(__file__).resolve().parent
results={}
for ext in ['blend','glb','fbx','obj']:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    p=str(out/('mohammad-character.'+ext))
    if ext=='blend': bpy.ops.wm.open_mainfile(filepath=p)
    elif ext=='glb': bpy.ops.import_scene.gltf(filepath=p)
    elif ext=='fbx': bpy.ops.import_scene.fbx(filepath=p)
    else: bpy.ops.wm.obj_import(filepath=p)
    meshes=[o for o in bpy.context.scene.objects if o.type=='MESH' and o.name!='Studio_Red_Backdrop']
    missing=[im.name for im in bpy.data.images if im.source=='FILE' and not im.packed_file and not Path(bpy.path.abspath(im.filepath)).exists()]
    results[ext]={'mesh_count':len(meshes),'faces':sum(len(o.data.polygons) for o in meshes),'missing_images':missing}
    assert len(meshes)>=10, (ext,'missing geometry')
    assert not missing, (ext,missing)
(out/'export-verification.json').write_text(json.dumps(results,indent=2))
print('EXPORT_VERIFICATION',json.dumps(results))
