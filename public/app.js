new Vue({
    el: '#app',

    data: {
        ws: null, // O websocket
        newMsg: '', 
        chatContent: '', 
        avatarurl: null, 
        username: null,
        staffemoji: 'https://cdn.discordapp.com/emojis/314068430787706880.png',
        channel: null,
        joined: false 
    },

    created: function() {
        var self = this;
        this.ws = new WebSocket('ws://' + window.location.host + '/ws');
        this.ws.addEventListener('message', function(e) {
            var msg = JSON.parse(e.data);
            if (this.username == "caycodev") {
                self.chatContent += '<div class="chip">'
                   + '<img src="' + self.avatarurl + '">'
                   + '<img src="' + 'https://cdn.discordapp.com/attachments/385054878940135426/393834893915717632/3.png' + '">'
                   + msg.username
                   + '</div>'
                   + emojione.toImage(msg.message) + '<br/>'; // """"Traduzir"""" os emojis
            } else {
            self.chatContent += '<div class="chip">'
                    + '<img src="' + self.avatarurl + '">' // Avatar
                    + msg.username
                + '</div>'
                + emojione.toImage(msg.message) + '<br/>'; // """"Traduzir"""" os emojis
        
            var element = document.getElementById('chat-messages');
            element.scrollTop = element.scrollHeight; //Descer o chat automaticamente
            }
        });

    },

    methods: {
        send: function () {
              if(this.newMsg.startsWith("https")) {
                   
                  this.ws.send(
                    JSON.stringify({
                        avatarurl: this.avatarurl,
                        username: this.username,
                        message: $('<a href="https://">').html(this.newMsg).text() // Mandar para o html
                    }
                ));
                 this.newMsg = '';
                } else {
            if (this.newMsg != '') {
                this.ws.send(
                    JSON.stringify({
                        avatarurl: this.avatarurl,
                        username: this.username,
                        message: $('<p>').html(this.newMsg).text() // Mandar para o html
                    }
                ));
             }

                 
                this.newMsg = ''; // Resetar a nova msg
            }
        },

        join: function () {
            if (!this.avatarurl) {
                Materialize.toast('Você tem que escolher um avatarurl', 2000);
                return
            }
            if (!this.username) {
                Materialize.toast('Você tem que escolher um username', 2000);
                return
            }
            this.avatarurl = $('<p>').html(this.avatarurl).text();
            this.username = $('<p>').html(this.username).text();
            this.joined = true;
        }
     
        
    }
});
