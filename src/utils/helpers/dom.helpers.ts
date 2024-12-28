/**
 * Get CSS vars from default or specified element
 */
export const getCssVars = (elem: HTMLElement = document.documentElement) => {
  const res: Map<string, CSSUnparsedSegment> = new Map()

  if ("computedStyleMap" in elem) {
    /**
     * Supported browsers
     *
     * @see https://caniuse.com/mdn-api_element_computedstylemap
     */
    const styles = elem.computedStyleMap()

    for (const style of styles) {
      const [prop, val] = style as [string, CSSUnparsedValue[]]

      if (prop.startsWith("--")) {
        res.set(prop, val[0][0])
      }
    }
  } else {
    /**
     * Fallback for unsupported browsers, aka Firefox
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/computedStyleMap
     */
    const styles = getComputedStyle(elem)

    for (let i = 0; i < styles.length; i++) {
      const prop = styles[i]

      if (prop.startsWith("--")) {
        res.set(prop, styles.getPropertyValue(prop))
      }
    }
  }

  return res
}

export const setCssVar = (
  key: string,
  value: string | null,
  elem: HTMLElement = document.documentElement,
) => {
  elem.style.setProperty(key, value)
}
