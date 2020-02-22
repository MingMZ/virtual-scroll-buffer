'use strict'

class VirtualScrollBuffer {
  minPosition = 0

  buffer = {
    position: 0,
    data: [],
  }

  constructor(minPosition = 0) {
    if (!Number.isInteger(minPosition)) {
      throw new Error(`Minimal position is invalid: ${minPosition}`)
    }
    this.minPosition = minPosition
  }

  get length() {
    return this.buffer.data.length || 0
  }

  getBuffer(position, length) {
    this._assertBufferPosition(position)
    this._assertLength(length)

    const relativePosition = position - this.buffer.position

    if (
      relativePosition + length - 1 < 0 ||
      this.buffer.data.length <= relativePosition
    ) {
      // get request for data outside of buffered range
      return { position: position, data: [] }
    }

    // return position is the starting position of actual buffered data array
    // not the position of get request
    const returnPosition = Math.max(this.buffer.position, position)
    const returnData = this.buffer.data.slice(
      returnPosition - this.buffer.position,
      relativePosition + length
    )

    return {
      position: returnPosition,
      data: returnData,
    }
  }

  setBuffer(position, data) {
    this._assertBufferData(data)
    this._assertBufferPosition(position)

    if (this.buffer.data.length === 0) {
      // current buffer is empty
      this.buffer = { position, data }
      return
    }

    if (
      position <= this.buffer.position &&
      this.buffer.position + this.buffer.data.length <= position + data.length
    ) {
      // new data supersede existing buffer
      this.buffer = { position, data }
      return
    }

    if (
      position + data.length < this.buffer.position ||
      this.buffer.position + this.buffer.data.length < position
    ) {
      // new data is disjoint from existing buffer by at least one element
      // replace existing buffer with new data
      this.buffer = { position, data }
      return
    }

    const before = this.buffer.data.slice(
      0,
      Math.max(position - this.buffer.position, 0)
    )

    const after = this.buffer.data.slice(
      position + data.length - this.buffer.position
    )

    this.buffer = {
      position: Math.min(this.buffer.position, position),
      data: [...before, ...data, ...after],
    }
  }

  reset() {
    this.buffer = {
      position: 0,
      data: [],
    }
  }

  _assertBufferData(items) {
    if (
      items === undefined ||
      items === null ||
      (Array.isArray(items) && items.length === 0)
    ) {
      throw new Error(`Buffer data contain no items`)
    }
  }

  _assertBufferPosition(position) {
    if (!Number.isInteger(position) || position < this.minPosition) {
      throw new Error(`Buffer position value is invalid: ${position}`)
    }
  }

  _assertLength(length) {
    if (!Number.isInteger(length) || length < 0) {
      throw new Error(`Length value is invalid: ${length}`)
    }
  }
}

export default {
  default: null,

  // initiate the default instance
  init(min = 0) {
    this.default = new VirtualScrollBuffer(min)
  },

  // create and return a new instance
  create() {
    return new VirtualScrollBuffer()
  },

  get length() {
    return this.default.length
  },

  getBuffer(position, length) {
    this._assertInit()
    return this.default.getBuffer(position, length)
  },

  setBuffer(position, data) {
    this._assertInit()
    return this.default.setBuffer(position, data)
  },

  reset() {
    this.default.reset()
  },

  _assertInit() {
    if (this.default === null) {
      throw new Error(
        'Please call init(...) to initialise virtual scroll buffer'
      )
    }
  },
}
