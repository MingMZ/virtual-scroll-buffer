'use strict'

class VirtualScrollBuffer {
  buffer = {
    position: 0,
    data: [],
  }

  constructor(capacity = 1000) {
    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new Error(`Capacity is invalid: ${capacity}`)
    }
    this.capacity = capacity
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

  truncateBuffer(position) {
    if (this.buffer.data.length <= this.capacity) {
      // under capacity
      return
    }

    if (
      position < this.buffer.position ||
      this.buffer.position + this.buffer.data.length <= position
    ) {
      // base truncate position is outside of buffer's range
      return
    }

    const newBuffer = this.buffer

    // calculate the number of items to be removed from relative given position
    let removeFromStart = position - newBuffer.position

    // if number of items allocated from position to upper bound of buffer is
    // below capacity, choose the method that remove the least number of items
    // from buffer

    if (this.buffer.data.length > this.capacity) {
      removeFromStart = Math.min(
        removeFromStart,
        this.buffer.data.length - this.capacity
      )
    }

    if (removeFromStart > 0) {
      newBuffer.position = newBuffer.position + removeFromStart
      newBuffer.data = newBuffer.data.slice(removeFromStart)
    }

    const removeFromEnd = newBuffer.data.length - this.capacity
    if (removeFromEnd > 0) {
      newBuffer.data = newBuffer.data.slice(0, this.capacity)
    }

    this.buffer = newBuffer
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
    if (!Number.isInteger(position)) {
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
  init(capacity = 1000) {
    this.default = new VirtualScrollBuffer(capacity)
  },

  // create and return a new instance
  create() {
    return new VirtualScrollBuffer()
  },

  get capacity() {
    return this.default.capacity
  },

  set capacity(value) {
    this.default.capacity = value
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
    this.default.setBuffer(position, data)
  },

  truncateBuffer(position) {
    this._assertInit()
    this.default.truncateBuffer(position)
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
