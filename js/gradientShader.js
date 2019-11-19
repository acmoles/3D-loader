var NoiseShader = {

	uniforms: {

    "u_resolution": { value: null },
		"tDiffuse": { value: null }

	},

	
//
// 	uniform vec2 u_resolution;
//
// vec3 colorA = vec3(0.000,0.000,0.000);
// vec3 colorB = vec3(1.000,1.000,1.000);
//
// void main() {
//     vec2 st = gl_FragCoord.xy/u_resolution.xy;
//     vec3 color = vec3(0.0);
//
//     vec3 pct = vec3(st.y);
//
//     color = mix(colorA, colorB, pct);
//
//     gl_FragColor = vec4(color,1.0);
// }




	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform vec2 u_resolution;",

		"varying vec2 vUv;",

    "vec3 blendOverlay(vec3 base, vec3 blend) {",

    "return mix(1.0 - 2.0 * (1.0 - base) * (1.0 - blend), 2.0 * base * blend, step(base, vec3(0.5)));",

    "}",

		"void main() {",

			"vec4 color = texture2D( tDiffuse, vUv );",
			"vec2 uvRandom = vUv;",

      "color.rgb = blendOverlay(color.rgb, color.rgb * random(uvRandom))*0.15;",

			"gl_FragColor = vec4( color );",

		"}"

	].join( "\n" )

};

export { NoiseShader };
