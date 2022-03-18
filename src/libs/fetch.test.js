import { jest } from '@jest/globals'
import axios from 'axios'

import { fetchDataFromDB } from './fetch.js'

jest.mock('axios')

describe('fetchDataFromDB', () => {
  test('取得できるか', () => {
    const res = {
      data: {
        results: {
          bindings: 'test'
        }
      }
    }

    axios.get.mockResolvedValue(res)

    expect(fetchDataFromDB('')).toEqual('test')
  })
})
