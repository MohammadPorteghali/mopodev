exec(open('/Users/mohammad/projects/mopodev-2/artifacts/character/inspect_source.py').read().split('bpy.ops.object.camera_add')[0])
for im in bpy.data.images:
    if im.type=='IMAGE':
        print('IMAGE',im.name,tuple(im.size))
        im.filepath_raw='/Users/mohammad/projects/mopodev-2/artifacts/character/source-texture.png'; im.file_format='PNG';im.save()
for o in bpy.context.scene.objects:
    if o.type=='MESH':
        print('MATERIALS',[(m.name,[(n.type,n.name) for n in m.node_tree.nodes]) for m in o.data.materials])
