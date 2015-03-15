package client

import (
	//"fmt"
	"crypto/ecdsa"
	"fmt"
	"math/rand"
	"time"
	"zombies/messages"
)

// type Survivor struct {
// 	x        float64
// 	y        float64
// 	goalx    float64
// 	goaly    float64
// 	asset_id string
// 	alive    bool
// }

func RecvMsgThread(survivor messages.Survivor, starttime int, token string, pubkey *ecdsa.PublicKey) {
	for starttime > time.Now().Second() {
		time.Sleep(5 * time.Second)
	}
	for survivor.Alive == true {
		msgs := messages.GetForAsset(survivor.Asset_id)
		for _, m := range *msgs {
			//this is fairly advanced, skipped for first tests
			survivor.Alive = messages.VerifySent(m, pubkey)
			fmt.Println(m)
		}
		time.Sleep(5 * time.Second)
	}
}

func SendMsgThread(survivor messages.Survivor, starttime int, token string) {
	for starttime > time.Now().Second() {
		time.Sleep(5 * time.Second)
	}

	for survivor.Alive == true {
		messages.CreateTiMsg(survivor, token)
		time.Sleep(5 * time.Second)
		fmt.Println("sending data")
	}

	//post the initial fence
	fenceid := messages.PostGeoFenceMessage(survivor.Asset_id, survivor.X, survivor.Y, token)
	//put, move random fences
	for survivor.Alive == false {
		survivor.X += (rand.Float64()*2.0 - 1.0) * .00032
		survivor.Y += (rand.Float64()*2.0 - 1.0) * .00032
		messages.PutGeoFenceMessage(survivor.Asset_id, survivor.X, survivor.Y, token, fenceid)
		messages.CreateTiMsg(survivor, token)
		time.Sleep(5 * time.Second)
		fmt.Println("sending fence data")
	}

}

func Create_New_Survivor(goalx float64, goaly float64, initialx float64, initialy float64, starttime int, asset_id string, token string, pubkey *ecdsa.PublicKey) {
	survivor := messages.Survivor{}
	survivor.Asset_id = asset_id
	survivor.Alive = true
	survivor.X = initialx
	survivor.Y = initialy
	survivor.Goalx = goalx
	survivor.Goaly = goaly

	RecvMsgThread(survivor, starttime, token, pubkey)
	SendMsgThread(survivor, starttime, token)

}
