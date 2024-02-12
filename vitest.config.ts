import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
  	include: ['src/**/*.{test,spec}.{js,ts}',
	],
	coverage: {
		  // provider: v8  // default is v8, but it did not work properly
	}
  },
})
