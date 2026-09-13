import bpy
from mathutils import Vector
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath='/Users/mohammad/projects/mopodev-2/public/head.glb')
for o in bpy.context.scene.objects:
    if o.type == 'MESH':
        print('SOURCE_MESH', o.name, len(o.data.vertices), tuple(o.dimensions), tuple(o.location))
        print('BOUNDS', [tuple(o.matrix_world @ Vector(v)) for v in o.bound_box])
bpy.ops.object.camera_add(location=(0,-4,0.15))
cam=bpy.context.object
cam.rotation_euler=(Vector((0,0,0.15))-cam.location).to_track_quat('-Z','Y').to_euler()
cam.data.type='ORTHO'; cam.data.ortho_scale=1.8
bpy.context.scene.camera=cam
for loc,power,size in [((-2,-3,3),500,3),((2,-2,1),250,3)]:
    bpy.ops.object.light_add(type='AREA',location=loc)
    o=bpy.context.object;o.data.energy=power;o.data.shape='DISK';o.data.size=size
    o.rotation_euler=(-o.location).to_track_quat('-Z','Y').to_euler()
s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=16
s.render.resolution_x=480;s.render.resolution_y=640;s.render.resolution_percentage=100
s.render.filepath='/Users/mohammad/projects/mopodev-2/artifacts/character/existing-source.png'
bpy.ops.render.render(write_still=True)
