/**
 * Incremental UTF-8 decoder for mini-program ArrayBuffer chunks.
 * TextDecoder is not guaranteed to exist in every WeChat base library.
 */
export class Utf8StreamDecoder {
  private pending = new Uint8Array()

  push(chunk: Uint8Array): string {
    if (chunk.length === 0) {
      return ''
    }

    const bytes = new Uint8Array(this.pending.length + chunk.length)
    bytes.set(this.pending)
    bytes.set(chunk, this.pending.length)

    let output = ''
    let cursor = 0

    while (cursor < bytes.length) {
      const first = bytes[cursor]
      let length = 0
      let codePoint = 0

      if (first < 0x80) {
        length = 1
        codePoint = first
      }
      else if (first >= 0xc2 && first <= 0xdf) {
        length = 2
        codePoint = first & 0x1f
      }
      else if (first >= 0xe0 && first <= 0xef) {
        length = 3
        codePoint = first & 0x0f
      }
      else if (first >= 0xf0 && first <= 0xf4) {
        length = 4
        codePoint = first & 0x07
      }
      else {
        throw new Error('Invalid UTF-8 leading byte')
      }

      if (cursor + length > bytes.length) {
        break
      }

      for (let offset = 1; offset < length; offset += 1) {
        const next = bytes[cursor + offset]
        if ((next & 0xc0) !== 0x80) {
          throw new Error('Invalid UTF-8 continuation byte')
        }
        codePoint = (codePoint << 6) | (next & 0x3f)
      }

      if (
        (length === 3 && codePoint < 0x800)
        || (length === 4 && codePoint < 0x10000)
        || codePoint > 0x10ffff
        || (codePoint >= 0xd800 && codePoint <= 0xdfff)
      ) {
        throw new Error('Invalid UTF-8 code point')
      }

      output += String.fromCodePoint(codePoint)
      cursor += length
    }

    this.pending = bytes.slice(cursor)
    return output
  }

  flush(): string {
    if (this.pending.length > 0) {
      throw new Error('Incomplete UTF-8 sequence')
    }
    return ''
  }
}
