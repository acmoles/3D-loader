var SharedShader = {

// Not used...
otherShader: `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}

uniform sampler2D map;

varying vec2 vUv;

void main()
{
		gl_FragColor = texture2D(map, vUv);
}
`
,

vertexShaderGrid:`

vY = position.y;

`,

randomFunction: `
float random(vec3 scale,float seed){return fract(sin(dot(gl_FragCoord.xyz+seed,scale))*43758.5453+seed);}
`,

blendFunction: `
vec3 blendOverlay(vec3 base, vec3 blend) {
	return mix(
        sqrt(base) * (2.0 * blend - 1.0) + 2.0 * base * (1.0 - blend),
        2.0 * base * blend + base * base * (1.0 - 2.0 * blend),
        step(base, vec3(0.5))
    );
}
`,

fragmentShaderOutput: `
vec2 st = gl_FragCoord.xy/resolution.xy;
float pct = 0.0;
pct = 2.*distance(st,vec2(0.8));
diffuseColor.rgb = blendOverlay( diffuseColor.rgb, vec3(1.0 - pct) );


float n = ( 1.42 - .64 * random( vec3( 1. ), length( gl_FragCoord ) ) );

diffuseColor.rgb = blendOverlay( diffuseColor.rgb, vec3( n ) );


// diffuseColor.rgb = vec3(1.0 - pct);
`
,

fragmentShaderOutputGrid: `
float val = smoothstep( .95, .05, vY );
vec3 col = mix( vec3( 1. ), vec3( 0.16 ), val );

// diffuseColor.rgb = 2.*col;
diffuseColor.rgb = blendOverlay( diffuseColor.rgb, col );



float n = ( 1.42 - .64 * random( vec3( 1. ), length( gl_FragCoord ) ) );

diffuseColor.rgb = blendOverlay( diffuseColor.rgb, vec3( n ) );
`
};


export { SharedShader };
