import { jest } from '@jest/globals'
import axios from 'axios'

import { fetchDataFromDB } from './fetch.js'

jest.mock('axios')

describe('fetchDataFromDB', () => {
  test('取得できるか', async () => {
    const bindings = [
      {
        name: { type: 'literal', value: '白菊ほたる' }
      }
    ]

    const res = { data: { results: { bindings } } }

    const getApiMock = jest.spyOn(axios, 'get')
    getApiMock.mockResolvedValue(res)

    expect(await fetchDataFromDB('')).toEqual(bindings)
  })

  test('データが無い場合にエラーを投げる', async () => {
    const res = { data: { results: undefined } }

    const getApiMock = jest.spyOn(axios, 'get')
    getApiMock.mockResolvedValue(res)

    await expect(fetchDataFromDB('')).rejects.toThrowError(
      new Error('[Error] データがありません')
    )
  })

  test('通信に失敗した時にエラーを投げる', async () => {
    const getApiMock = jest.spyOn(axios, 'get')
    getApiMock.mockRejectedValueOnce()

    await expect(fetchDataFromDB('')).rejects.toThrowError(
      /^\[Error\] im@sparqlにアクセスできません/
    )
  })
})
