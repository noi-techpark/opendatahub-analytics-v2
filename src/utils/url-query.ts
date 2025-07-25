// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

const DEFAULT_SESSION_STORAGE_KEY = 'odh_map_query_params'

export const updateUrlQueryParams = (
   params: Record<string, string | null>
): void => {
   const currentPath = window.location.pathname
   const currentSearch = new URLSearchParams(window.location.search)

   Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
         currentSearch.delete(key)
      } else {
         currentSearch.set(key, value)
      }
   })

   saveQueryParamsToSessionStorage(currentSearch)

   const newUrl = `${currentPath}${currentSearch.toString() ? '?' + currentSearch.toString() : ''}`
   window.history.replaceState({}, '', newUrl)
}

export const getUrlQueryParams = (
   params: string[]
): Record<string, string | null> => {
   const searchParams = new URLSearchParams(window.location.search)
   const result: Record<string, string | null> = {}

   params.forEach((param) => {
      result[param] = searchParams.get(param)
   })

   return result
}

export const saveQueryParamsToSessionStorage = (
   params?: URLSearchParams
): void => {
   const currentSearch = params || new URLSearchParams(window.location.search)

   if (currentSearch.toString()) {
      sessionStorage.setItem(
         DEFAULT_SESSION_STORAGE_KEY,
         currentSearch.toString()
      )
   } else {
      sessionStorage.removeItem(DEFAULT_SESSION_STORAGE_KEY)
   }
}

export const restoreQueryParamsFromSessionStorage = (
   hash: string = '',
   key: string = DEFAULT_SESSION_STORAGE_KEY
): boolean => {
   const storedParams = sessionStorage.getItem(key)
   const currentSearchString = new URLSearchParams(
      window.location.search
   ).toString()

   if (storedParams && storedParams !== currentSearchString) {
      const currentPath = window.location.pathname
      const newUrl = `${currentPath}${hash ? hash : ''}${storedParams ? '?' + storedParams : ''}`

      window.history.replaceState({}, '', newUrl)
      return true
   }

   return false
}
