precision mediump float;

uniform ivec2 u_grid_size;
uniform sampler2D u_texture;
uniform bool u_interpolate;
uniform float u_current_frame;

varying vec2 v_uv;

vec2 get_frame_offset(float frame)
{
    float looped_frame = mod(frame, float(u_grid_size.x * u_grid_size.y));

    float full_rows = floor(looped_frame / float(u_grid_size.x));
    float row_remainder = floor(mod(looped_frame, float(u_grid_size.x)));
    vec2 current_frame_offset = vec2(row_remainder, full_rows);

    return current_frame_offset;
}

void main()
{
    vec2 frame_size = vec2(1.0 / float(u_grid_size.x), 1.0 / float(u_grid_size.y));

    vec4 texture_color_prev = texture2D(u_texture, v_uv * frame_size + get_frame_offset(u_current_frame - 1.0) * frame_size);
    vec4 texture_color = texture2D(u_texture, v_uv * frame_size + get_frame_offset(u_current_frame) * frame_size);

    gl_FragColor = mix(texture_color_prev, texture_color, mod(u_current_frame, 1.0));
}