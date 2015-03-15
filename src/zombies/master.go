package main

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"zombies/client"
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
	pubkey := priv.PublicKey                                                          //priv.PublicKey
	client.Create_New_Survivor(10.1, 10.1, 4.4, 4.4, 0, "newasset", "12345", &pubkey) //, &pubkey)

	messages.SendEncrypted("batmobile", "die", priv)
}
