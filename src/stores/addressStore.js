// src/stores/addressStore.js
import { defineStore } from 'pinia'

export const useAddressStore = defineStore('address', {
  state: () => ({
    addresses: []
  }),
  actions: {
    addAddress(newAddress) {
      this.addresses.push(newAddress)
      this.persistAddresses()
    },
    updateAddress(index, updatedAddress) {
      this.addresses[index] = updatedAddress
      this.persistAddresses()
    },
    deleteAddress(index) {
      this.addresses.splice(index, 1)
      this.persistAddresses()
    },
    persistAddresses() {
      localStorage.setItem('addresses', JSON.stringify(this.addresses))
    },
    loadAddresses() {
      const storedAddresses = localStorage.getItem('addresses')
      this.addresses = storedAddresses ? JSON.parse(storedAddresses) : []
      return this.addresses // Devolver las direcciones cargadas
    }
  }
})
