import { promises as fs } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

// Create a require function
const require = createRequire(import.meta.url)

// Get __dirname equivalent in ES modules
const __dirname = dirname(fileURLToPath(import.meta.url))

// Installation: npm install --save-dev @iconify/tools @iconify/utils @iconify/json @iconify/iconify
import { cleanupSVG, importDirectory, isEmptyColor, parseColors, runSVGO } from '@iconify/tools'
import { getIcons, getIconsCSS, stringToIcon } from '@iconify/utils'

const sources = {
  json: [
    // Iconify JSON file (@iconify/json is a package name, /json/ is directory where files are, then filename)
    require.resolve('@iconify/json/json/ri.json'),
    require.resolve('@iconify/json/json/solar.json'),
    require.resolve('@iconify/json/json/lucide.json'),
    require.resolve('@iconify/json/json/svg-spinners.json'),
    require.resolve('@iconify/json/json/ion.json'),
  ],

  svg: [
    {
      dir: 'src/assets/iconify-icons/svg',
      monotone: false,
      prefix: 'custom'
    }
  ]
}

// File to save bundle to
const target = join(__dirname, 'generated-icons.css')

  ; (async function () {
    // Create directory for output if missing
    const dir = dirname(target)

    try {
      await fs.mkdir(dir, {
        recursive: true
      })
    } catch (err) {
      //
    }

    const allIcons = []

    /**
     * Bundle JSON files and collect icons
     */
    if (sources.json) {
      for (let i = 0; i < sources.json.length; i++) {
        const item = sources.json[i]

        // Load icon set
        const filename = typeof item === 'string' ? item : item.filename
        const content = JSON.parse(await fs.readFile(filename, 'utf8'))

        // Filter icons
        if (typeof item !== 'string' && item.icons?.length) {
          const filteredContent = getIcons(content, item.icons)
          if (!filteredContent) throw new Error(`Cannot find required icons in ${filename}`)
          allIcons.push(filteredContent)
        } else {
          // Collect all icons from the JSON file
          allIcons.push(content)
        }
      }
    }

    /**
     * Bundle custom SVG icons and collect icons
     */
    if (sources.svg) {
      for (let i = 0; i < sources.svg.length; i++) {
        const source = sources.svg[i]

        // Import icons
        const iconSet = await importDirectory(source.dir, {
          prefix: source.prefix
        })

        // Validate, clean up, fix palette, etc.
        await iconSet.forEach(async (name, type) => {
          if (type !== 'icon') return

          // Get SVG instance for parsing
          const svg = iconSet.toSVG(name)

          if (!svg) {
            // Invalid icon
            iconSet.remove(name)
            return
          }

          // Clean up and optimise icons
          try {
            // Clean up icon code
            await cleanupSVG(svg)

            if (source.monotone) {
              // Replace color with currentColor, add if missing
              await parseColors(svg, {
                defaultColor: 'currentColor',
                callback: (attr, colorStr, color) => {
                  return !color || isEmptyColor(color) ? colorStr : 'currentColor'
                }
              })
            }

            // Optimise
            await runSVGO(svg)
          } catch (err) {
            // Invalid icon
            console.error(`Error parsing ${name} from ${source.dir}:`, err)
            iconSet.remove(name)
            return
          }

          // Update icon from SVG instance
          iconSet.fromSVG(name, svg)
        })

        // Collect the SVG icon
        allIcons.push(iconSet.export())
      }
    }

    // Generate CSS from collected icons
    const cssContent = allIcons
      .map(iconSet => getIconsCSS(iconSet, Object.keys(iconSet.icons), { iconSelector: '.{prefix}-{name}' }))
      .join('\n')

    // Save the CSS to a file
    await fs.writeFile(target, cssContent, 'utf8')
    console.log(`Saved CSS to ${target}!`)
  })().catch(err => {
    console.error(err)
  })

/**
 * Sort icon names by prefix
 */
function organizeIconsList(icons) {
  const sorted = Object.create(null)

  icons.forEach(icon => {
    const item = stringToIcon(icon)
    if (!item) return

    const prefix = item.prefix
    const prefixList = sorted[prefix] ? sorted[prefix] : (sorted[prefix] = [])
    const name = item.name

    if (!prefixList.includes(name)) prefixList.push(name)
  })

  return sorted
}