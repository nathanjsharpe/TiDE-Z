package client

import (
	"fmt"
	"io/ioutil"
	"net/http"
	//"net/url"
	"bytes"
	"zombies/messages"
)

var my_asset_id string ;

type di_msg struct{
	message string    `json:"message"`
    asset_id string `json:"asset_id"`
    time int `json:"timestamp"`
    tiid int `json:"tiid"`
    sender string `json:"sender"`
	
	
}

func sendTiRaw( url string){
	var jsonStr = []byte(`{"asset_id":"golee","latitude":"40.1","longitude":"-87.1"}`)
    req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonStr))
    req.Header.Set("X-Auth-Token", "12345")
    req.Header.Set("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()
    fmt.Println("response Status:", resp.Status)
    fmt.Println("response Headers:", resp.Header)
    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println("response Body:", string(body))
}

func recvMsg(url string){
    
    msgs := messages.GetForAsset(my_asset_id)
    
    
//	var jsonStr = []byte(``)
//	req, err := http.NewRequest("GET", url, bytes.NewBuffer(jsonStr))
//    req.Header.Set("X-Auth-Token", "12345")
//    req.Header.Set("Content-Type", "application/json")
//	
//    client := &http.Client{}
//    resp, err := client.Do(req)
//    if err != nil {
//        panic(err)
//    }
//    defer resp.Body.Close()
//    fmt.Println("response Status:", resp.Status)
//    fmt.Println("response Headers:", resp.Header)
//    body, _ := ioutil.ReadAll(resp.Body)
//
//    fmt.Println("response Body:", string(body))

}

func main() {
	recvMsg("http://data.trakit.io/message/*")
    sendTiRaw( "http://data.trakit.io/ti_raw_msg")
    
    
}
