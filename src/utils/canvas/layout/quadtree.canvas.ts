// Types
import type { CanvasNode } from "@utils/canvas/nodes"
import type { Bounds } from "@ts/math.types"

// Utils
import { isShapeWithinBoundaries } from "@utils/helpers/canvas.helpers"

// Setup
const MAX_NODES_PER_QUADRANT = 10

export interface QuadTree {
  bounds: Bounds
  nodes: string[]
  quadrants: QuadTree[]
  isSubdivided: boolean
  add: (id: string, node: CanvasNode) => void
  intersects: (node: CanvasNode) => boolean | undefined
}

class QuadTreeImpl implements QuadTree {
  bounds: Bounds
  nodes: string[]
  quadrants: QuadTree[]
  isSubdivided: boolean

  constructor(bounds: Bounds) {
    this.bounds = bounds
    this.nodes = []
    this.quadrants = []
    this.isSubdivided = false
  }

  public add = (id: string, node: CanvasNode) => {
    // Check if the node is positioned within the current quadrant
    if (!this.intersects(node)) {
      return
    }

    // If there is space, add it to the current QuadTree
    if (this.nodes.length < MAX_NODES_PER_QUADRANT) {
      this.nodes.push(id)

      return
    }

    if (!this.isSubdivided) {
      this.#subdivide()
    }

    // Otherwise, add the node to the relevant subquadrant
    const targetQuad = [...this.quadrants.values()].find((quad) => quad.intersects(node))

    if (!targetQuad) {
      throw new Error("Unhandled exception: valid quadrant not found.")
    }

    targetQuad.add(id, node)
  }

  public intersects = (node: CanvasNode) => {
    return isShapeWithinBoundaries(node.primitive, this.bounds)
  }

  /**
   * Subdivide quadrant into four other areas, each using their own Cartesian-centred coordinates
   */
  #subdivide = () => {
    if (!this.bounds) return

    const { x, y, width, height } = this.bounds

    const newCoordX = width / 4
    const newCoordY = height / 4
    const newWidth = width / 2
    const newHeight = height / 2

    const nw = {
      x: x - newCoordX,
      y: y - newCoordY,
      width: newWidth,
      height: newHeight,
    }

    const ne = {
      x: x + newCoordX,
      y: y - newCoordY,
      width: newWidth,
      height: newHeight,
    }

    const sw = {
      x: x + newCoordX,
      y: y + newCoordY,
      width: newWidth,
      height: newHeight,
    }

    const se = {
      x: x - newCoordX,
      y: y + newCoordY,
      width: newWidth,
      height: newHeight,
    }

    this.quadrants.push(
      new QuadTreeImpl(nw),
      new QuadTreeImpl(ne),
      new QuadTreeImpl(sw),
      new QuadTreeImpl(se),
    )

    this.isSubdivided = true
  }
}

export default QuadTreeImpl
