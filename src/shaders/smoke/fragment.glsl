uniform float u_time;
uniform vec3 u_smoke;
uniform sampler2D u_texture;

varying vec2 vUv;

void main()
{
    vec2 smoke_uv = vUv * .33;

    float smoke = texture2D(u_texture, smoke_uv + vec2(u_time, 0.0) * -.1).r;

    smoke = smoothstep(0.4, 1.0, smoke);

    //Edges
    smoke *= smoothstep(0.0, 0.1, vUv.x);
    smoke *= smoothstep(1.0, 0.1, vUv.x);
    smoke *= smoothstep(0.0, 0.2, vUv.y);
    smoke *= smoothstep(1.0, 0.8, vUv.y);

    gl_FragColor = vec4(u_smoke, smoke);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}