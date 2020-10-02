console.log("Service Worker Loaded...");

self.addEventListener("push", (e) => {
	const data = e.data.json();
	console.log("Push Recieved...");
	self.registration.showNotification(data.title, {
		body: data.body,
		icon: "https://escalade-montesquieu.fr/assets/img/apple/apple-touch-icon-180x180.png",
	});
});
