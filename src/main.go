package main

import (

	"log"
	"net/http"


	"github.com/gorilla/websocket"
)

var clients = make(map[*websocket.Conn]bool) // connected clients
var broadcast = make(chan Message)           // broadcast channel

//Configurar o atualizador
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}



//Estrutura do negocio
type Message struct {
	AvatarUrl string `json:"avatarurl"`
	Username string `json:"username"`
	Channel string `json:"channel"`
	Message string `json:"message"`
}
func main() {

	// Criar um arquivo

	fs := http.FileServer(http.Dir("../public"))
	http.Handle("/", fs)


	// Configurar a rota dos websocket
	http.HandleFunc("/ws", handleConnections)

	go handleMessages()

	//Iniciar o servidor na porta 8000 e debugar
	log.Println("Http server iniciado na porta :8000")
	err := http.ListenAndServe(":8000", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
// Interceptar as conexões
func handleConnections(w http.ResponseWriter, r *http.Request) {

	// Atualizar o pedido GET para um websocket
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
	}

	// Ter certeza que feixou a conexão

	defer ws.Close()

	// Registrar o novo cliente
	clients[ws] = true

	for {
		var msg Message
		// Ler a nova mensagem como JSON
		err := ws.ReadJSON(&msg)
		if err != nil {
			log.Printf("error: %v", err)
			delete(clients, ws)
			break
		}
		broadcast <- msg
	}
}

func handleMessages() {
	for {
		// Pegar a mensagem do canal
		msg := <-broadcast
		// Mandar para os clientes que estão conectados
		for client := range clients {
			err := client.WriteJSON(msg)
			if err != nil {
				log.Printf("error: %v", err)
				client.Close()
				delete(clients, client)
			}
		}
	}
}


