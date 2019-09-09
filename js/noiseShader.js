var NoiseShader = {

	uniforms: {

    "tDiffuse": { value: null },
    "seed": { value: 0.01 },
    "amount": { value: 0.14 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform float seed;",

    "uniform float amount;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

    // "vec3 blendOverlay(vec3 base, vec3 blend) {",
    //
    // "return mix(1.0 - 2.0 * (1.0 - base) * (1.0 - blend), 2.0 * base * blend, step(base, vec3(0.5)));",
    //
    // "}",

		"float random( vec2 p ) {",
      "vec2 K1 = vec2(23.14069263277926, 2.665144142690225);",

			"return fract( cos( dot(p,K1) ) * 12345.6789 );",

		"}",

		"void main() {",

			"vec4 color = texture2D( tDiffuse, vUv );",
			"vec2 uvRandom = vUv;",

			"uvRandom.y *= random(vec2(uvRandom.y, seed));",

      // "color.rgb = blendOverlay(color.rgb, color.rgb * random(uvRandom))*0.15;",
      "color.rgb += random(uvRandom)*amount;",

			"gl_FragColor = vec4( color  );",

		"}"

	].join( "\n" )

};

export { NoiseShader };
