uniform sampler2D u_texture;
uniform float u_time;

varying vec2 vUv;

vec2 rotate2D(vec2 value, float angle)
{
    float s = sin(angle);
    float c = cos(angle);
    mat2 m = mat2(c, s, -s, c);
    return m * value;
}

void main()
{
    vec2 smoke_uv = vUv * .33;

    vec3 newPosition = position;

    // Elevation
    //float elevation = 0.07;
    //newPosition.xz += (vec2(texture2D(u_texture, smoke_uv + vec2(-u_time * .05, 0.0)).r) - .5) * 2.0 * elevation;

    //Twist
    float angle = 10.0;
    newPosition.xz = rotate2D(newPosition.xz, angle * texture2D(u_texture, vec2(position.y * 0.6 + u_time * .01, 0.5)).r + u_time * .3 + position.y * 3.2);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

    vUv = uv;
}