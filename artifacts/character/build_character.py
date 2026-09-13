"""Reference-guided refinement of the project's existing textured character mesh.
Run with Blender --background --python artifacts/character/build_character.py.
The source mesh is preserved; only derived artifacts are written here.
"""
import bpy, math, json, os
from pathlib import Path
from mathutils import Vector

OUT = Path(__file__).resolve().parent
ROOT = OUT.parent.parent
REF = '/Users/mohammad/Downloads/ChatGPT Image Sep 13, 2026, 02_21_30 PM.png'
REV = int(os.environ.get('CHARACTER_REVISION', '1'))
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(ROOT / 'public/head.glb'))
source = next(o for o in bpy.context.scene.objects if o.type == 'MESH')
bpy.context.view_layer.objects.active = source
source.select_set(True)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
mesh = source.data
material = mesh.materials[0]
principled = next(n for n in material.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
base_node = principled.inputs['Base Color'].links[0].from_node
texture = base_node.image
pixels = list(texture.pixels[:]); tw, th = texture.size
uvs = mesh.uv_layers.active.data

def sample(face):
    uv = sum((uvs[i].uv for i in face.loop_indices), Vector((0,0))) / len(face.loop_indices)
    idx = (min(th-1, int(uv.y*th)) * tw + min(tw-1, int(uv.x*tw))) * 4
    return pixels[idx:idx+3]

# Keep surface connectivity and UVs during smooth, local proportion adjustments.
eyes = [Vector((-.085,-.40,.325)), Vector((.153,-.40,.36))]
for v in mesh.vertices:
    p = v.co.copy()
    if p.y < -.18:
        for c in eyes:
            d = ((p.x-c.x)/.14)**2 + ((p.z-c.z)/.15)**2
            weight = math.exp(-d*1.7) * min(1, max(0,(-p.y-.18)/.14))
            amount = .32 if REV == 1 else .48
            v.co.x += (p.x-c.x)*amount*weight
            v.co.z += (p.z-c.z)*amount*weight
        # Modest extra cheek width, concentrated above the jaw.
        v.co.x += p.x * .045 * math.exp(-((p.z-.24)/.35)**2)
    if REV >= 3:
        # The second comparison showed a narrower, shorter face than the reference.
        head_weight = min(1, max(0, (p.z+.38)/.22))
        v.co.x *= 1 + .12*head_weight
        v.co.z += (p.z-.30)*.10*head_weight

groups = {}
for f in mesh.polygons:
    p = sum((mesh.vertices[i].co for i in f.vertices), Vector()) / len(f.vertices)
    r,g,b = sample(f)
    if p.z < -.33 and b > r*1.05:
        name = 'Shirt_Collar' if p.z > -.64 and abs(p.x) < .40 else 'Shirt_Torso'
    elif p.z > .53 and r < .38 and g < .27:
        name = 'Hair_SweptCap'
    elif abs(p.x) > .32 and -.04 < p.z < .43 and p.y < .1:
        name = 'Ear_Left' if p.x < 0 else 'Ear_Right'
    elif p.y < -.26 and any(((p.x-c.x)/.092)**2+((p.z-c.z)/.105)**2 < 1 for c in eyes):
        name = 'Eye_Left_Surface' if p.x < .025 else 'Eye_Right_Surface'
    elif p.y < -.28 and p.z < .13 and r < .32 and g < .23:
        name = 'Beard_and_Moustache'
    elif p.y < -.26 and .40 < p.z < .59 and r < .35 and g < .23:
        name = 'Eyebrows'
    elif p.z < -.22:
        name = 'Neck_and_Chest'
    else:
        name = 'Head_Face'
    groups.setdefault(name, []).append(f.index)

character = bpy.data.collections.new('CHARACTER_Editable')
bpy.context.scene.collection.children.link(character)
parts = []
for name, indices in groups.items():
    # Face subsets retain their original UV coordinates and coincident boundaries.
    old_ids = sorted({v for idx in indices for v in mesh.polygons[idx].vertices})
    remap = {old:new for new,old in enumerate(old_ids)}
    data = bpy.data.meshes.new(name+'_Mesh')
    data.from_pydata([mesh.vertices[i].co for i in old_ids], [], [[remap[i] for i in mesh.polygons[idx].vertices] for idx in indices])
    data.update()
    layer = data.uv_layers.new(name='UVMap')
    for new_face, old_index in zip(data.polygons, indices):
        new_face.use_smooth = True
        for new_loop, old_loop in zip(new_face.loop_indices, mesh.polygons[old_index].loop_indices):
            layer.data[new_loop].uv = uvs[old_loop].uv
    obj = bpy.data.objects.new(name,data); character.objects.link(obj); parts.append(obj)
    mat = material.copy(); mat.name = name+'_Material'; data.materials.append(mat)
    bs = next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
    for socket in ['Metallic','Roughness']:
        for link in list(bs.inputs[socket].links): mat.node_tree.links.remove(link)
    bs.inputs['Metallic'].default_value = 0
    bs.inputs['Roughness'].default_value = .74 if 'Eye_' not in name else .45
    bs.inputs['Specular IOR Level'].default_value = .22
    # Existing normal atlas includes reconstruction artifacts; reduce their impact.
    for n in mat.node_tree.nodes:
        if n.type == 'NORMAL_MAP': n.inputs['Strength'].default_value = .15
    obj['construction'] = 'UV-preserving segmented surface; original triangulated topology'
    obj['scale_note'] = 'Unitless reference proportions; physical dimensions were not supplied.'
    # Weld coincident geometry within each surface without modifying its silhouette.
    bpy.ops.object.select_all(action='DESELECT'); obj.select_set(True); bpy.context.view_layer.objects.active=obj
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.remove_doubles(threshold=0.000001)
    bpy.ops.object.mode_set(mode='OBJECT')
bpy.data.objects.remove(source, do_unlink=True)

scene=bpy.context.scene
scene.unit_settings.system='NONE'
scene.render.engine='CYCLES';scene.cycles.samples=48
scene.cycles.use_denoising=True
scene.render.resolution_x=720;scene.render.resolution_y=960;scene.render.resolution_percentage=100
scene.view_settings.view_transform='AgX'
scene.world.color=(.17,.17,.17)
bpy.ops.object.camera_add(location=(0,-7.4 if REV >= 2 else -6.4,.17))
cam=bpy.context.object;cam.name='Camera_Reference_Front_85mm'
cam.rotation_euler=(Vector((0,0,.09 if REV >= 2 else .04))-cam.location).to_track_quat('-Z','Y').to_euler()
cam.data.lens=85;cam.data.sensor_fit='VERTICAL';cam.data.sensor_height=24
scene.camera=cam
for name, loc,power,size in [('Key_Softbox',(-3,-4,4),600,4),('Fill_Softbox',(3,-3,1),250,3),('Hair_Rim',(0,2,3),400,2)]:
    bpy.ops.object.light_add(type='AREA',location=loc)
    light=bpy.context.object;light.name=name;light.data.energy=power;light.data.shape='DISK';light.data.size=size
    light.rotation_euler=(Vector((0,0,.1))-light.location).to_track_quat('-Z','Y').to_euler()
# Red studio background belongs to the render only, not to the model exports.
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,1.5,0),rotation=(math.pi/2,0,0))
back=bpy.context.object;back.name='Studio_Red_Backdrop'
mat=bpy.data.materials.new('Studio_Red');mat.diffuse_color=(.58,.003,.027,1);mat.use_nodes=True
bs=mat.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(.58,.003,.027,1);bs.inputs['Roughness'].default_value=1
back.data.materials.append(mat)
# Packed reference is available in the source file without becoming export geometry.
ref=bpy.data.images.load(REF,check_existing=True);ref.pack()
notes=bpy.data.texts.new('README_Model')
notes.write('Reference-guided refinement of existing public/head.glb, not an automatic multiview reconstruction.\nMajor surface components separated and named; UV textures preserved.\nTriangulated topology is editable, but not animation-ready quad retopology. Component seams are open surface boundaries; this is not a watertight print model.\nBack geometry is inherited from the existing mesh because reference views do not establish it.\n85 mm is an estimated portrait lens, not recovered EXIF. Scale is arbitrary.\n')
scene.render.filepath=str(OUT/f'comparison-render-v{REV}.png')
bpy.ops.render.render(write_still=True)

if REV >= 2:
    # Actual rendered reference comparison, with the source image on the left.
    reference=bpy.data.images.load(REF,check_existing=False)
    reference.scale(720,960)
    rendered=bpy.data.images.load(str(OUT/f'comparison-render-v{REV}.png'),check_existing=False)
    a=list(reference.pixels[:]); b=list(rendered.pixels[:]); combined=[]
    for row in range(960):
        start=row*720*4; end=start+720*4
        combined.extend(a[start:end]); combined.extend(b[start:end])
    board=bpy.data.images.new('Reference_Left_Model_Right',width=1440,height=960)
    board.pixels=combined;board.filepath_raw=str(OUT/'reference-vs-model.png');board.file_format='PNG';board.save()
    bpy.data.images.remove(reference);bpy.data.images.remove(rendered);bpy.data.images.remove(board)
    texture_dir=OUT/'textures';texture_dir.mkdir(exist_ok=True)
    for im in bpy.data.images:
        if im.name.startswith('Image_'):
            im.filepath_raw=str(texture_dir/(im.name+'.png'));im.file_format='PNG';im.save();im.pack()
    bpy.ops.object.select_all(action='DESELECT')
    for obj in parts: obj.select_set(True)
    bpy.context.view_layer.objects.active=parts[0]
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'mohammad-character.blend'))
    bpy.ops.export_scene.gltf(filepath=str(OUT/'mohammad-character.glb'),export_format='GLB',use_selection=True)
    bpy.ops.export_scene.fbx(filepath=str(OUT/'mohammad-character.fbx'),use_selection=True,object_types={'MESH'},path_mode='COPY',embed_textures=True,add_leaf_bones=False)
    bpy.ops.wm.obj_export(filepath=str(OUT/'mohammad-character.obj'),export_selected_objects=True,export_materials=True,path_mode='COPY')
    # Blender's packed-image exporter may emit basenames instead of copying images.
    import shutil
    for filename in ['Image_0.png', 'Image_2.png']:
        shutil.copyfile(texture_dir/filename,OUT/filename)
    report={'revision':REV,'objects':[{ 'name':o.name,'vertices':len(o.data.vertices),'faces':len(o.data.polygons)} for o in parts], 'camera_lens_mm_estimated':85,'physical_scale':'unspecified','base_mesh':'public/head.glb'}
    (OUT/'model-report.json').write_text(json.dumps(report,indent=2))
