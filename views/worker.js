console.log("Service Worker Loaded...");

self.addEventListener("push", (e) => {
	const data = e.data.json();
	console.log("Push Recieved...");
	self.registration.getNotifications()
        .then(function (notifications) {
			notifications.filter(notification=>notification.data.forum==data.forum).forEach(notification => notification.close());
			self.registration.showNotification(`${data.author} - ${data.forum.charAt(0).toUpperCase() +data.forum.slice(1).replace(/-/g, ' ')}`, {
				body: data.content,
				tag: `${data.forum}.${data.id}`,
				icon: "https://escalade-montesquieu.fr/assets/img/apple/apple-touch-icon-180x180.png",
				badge: "https://escalade-montesquieu.fr/assets/img/favicon.ico",
				vibrate: [200, 100, 200, 100, 200, 100, 200],
				data: {
					url: data.url,
					forum: data.forum,
					author: data.author
				}
			});
        })
	
});


self.onnotificationclick = function(event) {
	event.notification.close();
  
	// This looks to see if the current is already open and
	// focuses if it is
	event.waitUntil(clients.matchAll({
	  type: "window"
	}).then(function(clientList) {
	  for (var i = 0; i < clientList.length; i++) {
		var client = clientList[i];
		if (client.url == event.notification.url && 'focus' in client)
		  return client.focus();
	  }
	  if (clients.openWindow)
		return clients.openWindow(event.notification.data.url);
	}));
};