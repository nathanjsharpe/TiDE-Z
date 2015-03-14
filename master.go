package main

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"zombies/messages"
)

type Asset struct {
	Id            int    `json:"id"`
	DeviceAddress string `json:"deviceAddress"`
	Name          string `json:"name"`
	Group         string `json:"group"`
	Notes         string `json:"notes"`
	Color         string `json:"color"`
	Icon          string `json:"icon"`
}

func main() {
	priv, _ := ecdsa.GenerateKey(elliptic.P384(), rand.Reader)

	messages.SendEncrypted("batmobile", "die", priv)
}
