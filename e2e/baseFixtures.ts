import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import { test as baseTest } from '@playwright/test'

const istanbulCLIOutput = path.join(__dirname, '../.nyc_output')

export function generateUUID(): string {
  return crypto.randomBytes(16).toString('hex')
}

export const test = baseTest.extend({
  context: async ({ context }, use) => {
    try {
      await context.addInitScript(() =>
        window.addEventListener('beforeunload', () =>
          (window as any).collectIstanbulCoverage(
            JSON.stringify((window as any).__coverage__)
          )
        )
      )
      await fs.promises.mkdir(istanbulCLIOutput, { recursive: true })
      await context.exposeFunction(
        'collectIstanbulCoverage',
        (coverageJSON: string) => {
          if (coverageJSON) {
            if (!fs.statSync(istanbulCLIOutput).isDirectory()) {
              fs.mkdirSync(istanbulCLIOutput)
            }
            fs.writeFileSync(
              path.join(
                istanbulCLIOutput,
                `playwright_coverage_${generateUUID()}.json`
              ),
              coverageJSON
            )
          }
        }
      )
      await use(context)
      for (const page of context.pages()) {
        await page.evaluate(() =>
          (window as any).collectIstanbulCoverage(
            JSON.stringify((window as any).__coverage__)
          )
        )
        await page.close()
      }
    } catch (error) {
      console.log('error', error)
    }
  },
})

export const expect = test.expect
