import assert from "node:assert/strict"
import test from "node:test"
import { storeCodeBase } from "./store-code"

test("mengambil nama merek dan membuang kata bisnis generik", () => {
  assert.equal(storeCodeBase("Warjon Nusantara"), "WARJON")
  assert.equal(storeCodeBase("Kopi Senja"), "SENJA")
  assert.equal(storeCodeBase("PT Toko Berkah Jaya"), "BERKAH")
})

test("menormalkan simbol, spasi, dan karakter beraksen", () => {
  assert.equal(storeCodeBase("  Dapur Mamah!  "), "DAPUR")
  assert.equal(storeCodeBase("Café Élan"), "ELAN")
})

test("menggabungkan kata pendek agar tetap mudah dikenali", () => {
  assert.equal(storeCodeBase("RM Bu Tini"), "BUTINI")
  assert.equal(storeCodeBase("CV 88"), "88")
})
