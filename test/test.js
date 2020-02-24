import vsb from '../src/virtual-scroll-buffer'

var assert = require('chai').assert

describe('virtual-scroll-buffer', () => {
  describe('init()', () => {
    it('should initialise the buffer', () => {
      assert.doesNotThrow(() => vsb.init(1))
    })

    it('should throw when value is not an integer', () => {
      assert.throws(() => vsb.init(1.5))
    })

    it('should throw when value is zero', () => {
      assert.throws(() => vsb.init(0))
    })

    it('should throw when value is negative', () => {
      assert.throws(() => vsb.init(-1))
    })
  })

  describe('length', () => {
    it('should return length of buffer', () => {
      vsb.init()
      vsb.default.buffer.data = [1, 2, 3, 4, 5]
      assert.equal(vsb.length, 5)
    })
  })

  describe('getBuffer()', () => {
    const tests = [
      {
        setup: { position: 0, data: [] },
        args: [0, 0],
        expected: { position: 0, data: [] },
      },
      {
        setup: { position: 10, data: [1, 2, 3, 4, 5] },
        args: [0, 5],
        expected: { position: 0, data: [] },
      },
      {
        setup: { position: 10, data: [1, 2, 3, 4, 5] },
        args: [0, 10],
        expected: { position: 0, data: [] },
      },
      {
        setup: { position: 10, data: [1, 2, 3, 4, 5] },
        args: [9, 3],
        expected: { position: 10, data: [1, 2] },
      },
      {
        setup: { position: 10, data: [1, 2, 3, 4, 5] },
        args: [10, 1],
        expected: { position: 10, data: [1] },
      },
      {
        setup: { position: 10, data: [1, 2, 3, 4, 5] },
        args: [12, 1],
        expected: { position: 12, data: [3] },
      },
      {
        setup: { position: 10, data: [1, 2, 3, 4, 5] },
        args: [14, 1],
        expected: { position: 14, data: [5] },
      },
      {
        setup: { position: 10, data: [1, 2, 3, 4, 5] },
        args: [10, 5],
        expected: { position: 10, data: [1, 2, 3, 4, 5] },
      },
      {
        setup: { position: 10, data: [1, 2, 3, 4, 5] },
        args: [12, 5],
        expected: { position: 12, data: [3, 4, 5] },
      },
      {
        setup: { position: 10, data: [1, 2, 3, 4, 5] },
        args: [15, 10],
        expected: { position: 15, data: [] },
      },
      {
        setup: { position: 10, data: [1, 2, 3, 4, 5] },
        args: [20, 10],
        expected: { position: 20, data: [] },
      },
    ]

    tests.forEach(test => {
      it(`(${test.setup.position},[${test.setup.data.join(
        ','
      )}]) -> getBuffer(${test.args[0]},${test.args[1]}) returns (${
        test.expected.position
      },${test.expected.data.join(',')})`, () => {
        vsb.init()
        vsb.default.buffer = test.setup
        const result = vsb.getBuffer.apply(vsb, test.args)
        assert.equal(result.position, test.expected.position)
        assert.deepEqual(result.data, test.expected.data)
      })
    })
  })

  describe('setBuffer()', () => {
    const tests = [
      {
        setup: { position: 0, data: [] },
        args: [0, [1, 2, 3, 4, 5]],
        expected: { position: 0, data: [1, 2, 3, 4, 5] },
      },
      {
        setup: { position: 0, data: [] },
        args: [5, [1, 2, 3, 4, 5]],
        expected: { position: 5, data: [1, 2, 3, 4, 5] },
      },
      {
        setup: { position: 5, data: [1, 2, 3, 4, 5] },
        args: [0, [5, 4, 3, 2]],
        expected: { position: 0, data: [5, 4, 3, 2] },
      },
      {
        setup: { position: 5, data: [1, 2, 3, 4, 5] },
        args: [0, [5, 4, 3, 2, 1]],
        expected: { position: 0, data: [5, 4, 3, 2, 1, 1, 2, 3, 4, 5] },
      },
      {
        setup: { position: 5, data: [1, 2, 3, 4, 5] },
        args: [1, [5, 4, 3, 2, 1]],
        expected: { position: 1, data: [5, 4, 3, 2, 1, 2, 3, 4, 5] },
      },
      {
        setup: { position: 5, data: [1, 2, 3, 4, 5] },
        args: [3, [5, 4, 3, 2, 1]],
        expected: { position: 3, data: [5, 4, 3, 2, 1, 4, 5] },
      },
      {
        setup: { position: 5, data: [1, 2, 3, 4, 5] },
        args: [4, [5, 4, 3, 2, 1, 0]],
        expected: { position: 4, data: [5, 4, 3, 2, 1, 0] },
      },
      {
        setup: { position: 5, data: [1, 2, 3, 4, 5] },
        args: [5, [5, 4, 3]],
        expected: { position: 5, data: [5, 4, 3, 4, 5] },
      },
      {
        setup: { position: 5, data: [1, 2, 3, 4, 5] },
        args: [5, [5, 4, 3, 2, 1]],
        expected: { position: 5, data: [5, 4, 3, 2, 1] },
      },
      {
        setup: { position: 5, data: [1, 2, 3, 4, 5] },
        args: [7, [3, 2, 1]],
        expected: { position: 5, data: [1, 2, 3, 2, 1] },
      },
      {
        setup: { position: 5, data: [1, 2, 3, 4, 5] },
        args: [5, [5, 4, 3, 2, 1, 0]],
        expected: { position: 5, data: [5, 4, 3, 2, 1, 0] },
      },
      {
        setup: { position: 5, data: [1, 2, 3, 4, 5] },
        args: [7, [5, 4, 3, 2, 1]],
        expected: { position: 5, data: [1, 2, 5, 4, 3, 2, 1] },
      },
      {
        setup: { position: 5, data: [1, 2, 3, 4, 5] },
        args: [9, [5, 4, 3, 2, 1]],
        expected: { position: 5, data: [1, 2, 3, 4, 5, 4, 3, 2, 1] },
      },
      {
        setup: { position: 5, data: [1, 2, 3, 4, 5] },
        args: [10, [5, 4, 3, 2, 1]],
        expected: { position: 5, data: [1, 2, 3, 4, 5, 5, 4, 3, 2, 1] },
      },
      {
        setup: { position: 5, data: [1, 2, 3, 4, 5] },
        args: [11, [5, 4, 3, 2, 1]],
        expected: { position: 11, data: [5, 4, 3, 2, 1] },
      },
    ]

    tests.forEach(test => {
      it(`(${test.setup.position},[${test.setup.data.join(
        ','
      )}]) -> setBuffer(${test.args[0]},[${test.args[1].join(',')}])`, () => {
        vsb.init()
        vsb.default.buffer = test.setup
        vsb.setBuffer.apply(vsb, test.args)
        assert.equal(vsb.default.buffer.position, test.expected.position)
        assert.deepEqual(vsb.default.buffer.data, test.expected.data)
      })
    })
  })

  describe('truncateBuffer()', () => {
    const tests = [
      {
        args: {
          buffer: { position: 0, data: [] },
          capacity: 10,
          position: 0,
        },
        expected: { position: 0, data: [] },
      },
      {
        args: {
          buffer: {
            position: 0,
            data: Array.from({ length: 10 }, (_, i) => i),
          },
          capacity: 10,
          position: 0,
        },
        expected: {
          position: 0,
          data: Array.from({ length: 10 }, (_, i) => i),
        },
      },
      {
        args: {
          buffer: {
            position: 0,
            data: Array.from({ length: 10 }, (_, i) => i),
          },
          capacity: 5,
          position: 0,
        },
        expected: {
          position: 0,
          data: Array.from({ length: 5 }, (_, i) => i),
        },
      },
      {
        args: {
          buffer: {
            position: 0,
            data: Array.from({ length: 10 }, (_, i) => i),
          },
          capacity: 5,
          position: 5,
        },
        expected: {
          position: 5,
          data: Array.from({ length: 5 }, (_, i) => 5 + i),
        },
      },
      {
        args: {
          buffer: {
            position: 0,
            data: Array.from({ length: 10 }, (_, i) => i),
          },
          capacity: 8,
          position: 5,
        },
        expected: {
          position: 2,
          data: Array.from({ length: 8 }, (_, i) => 2 + i),
        },
      },
      {
        args: {
          buffer: {
            position: 0,
            data: Array.from({ length: 10 }, (_, i) => i),
          },
          capacity: 10,
          position: 5,
        },
        expected: {
          position: 0,
          data: Array.from({ length: 10 }, (_, i) => i),
        },
      },
      {
        args: {
          buffer: {
            position: 10,
            data: Array.from({ length: 10 }, (_, i) => i),
          },
          capacity: 5,
          position: 0,
        },
        expected: {
          position: 10,
          data: Array.from({ length: 10 }, (_, i) => i),
        },
      },
      {
        args: {
          buffer: {
            position: 10,
            data: Array.from({ length: 10 }, (_, i) => i),
          },
          capacity: 5,
          position: 10,
        },
        expected: {
          position: 10,
          data: Array.from({ length: 5 }, (_, i) => i),
        },
      },
      {
        args: {
          buffer: {
            position: 10,
            data: Array.from({ length: 10 }, (_, i) => i),
          },
          capacity: 5,
          position: 20,
        },
        expected: {
          position: 10,
          data: Array.from({ length: 10 }, (_, i) => i),
        },
      },
    ]

    tests.forEach(test => {
      it(`(${test.args.buffer.position},[len:${test.args.buffer.data.length}]) -> truncateBuffer(${test.args.position}) with capacity of ${test.args.capacity}`, () => {
        vsb.init(test.args.capacity)
        vsb.default.buffer = test.args.buffer
        vsb.truncateBuffer.apply(vsb, [test.args.position])
        assert.equal(
          vsb.default.buffer.position,
          test.expected.position,
          'Buffer position changed'
        )
        assert.deepEqual(
          vsb.default.buffer.data,
          test.expected.data,
          'Buffer content changed'
        )
      })
    })
  })
})
