const publicVapidKey = "BH25QhGzdhhFsj8D0Ws71rdpwvW4q_PuqHZRDmZpRoDlItnhRMQ9zvnTT4rfIklgWKxIkFfqqMu49ibGqfiaGlc";

// Check for service worker
if ("serviceWorker" in navigator) {
	send().catch(e => console.error(e));
}

function onRegistration(registration) {
	if (registration.waiting) {
	  	registration.waiting.addEventListener('statechange', onStateChange('waiting', registration));
	}
  
	if (registration.installing) {
	  	registration.installing.addEventListener('statechange', onStateChange('installing', registration));
	}
  
	if (registration.active) {
		registration.active.addEventListener('statechange', onStateChange('active', registration));
	}
  }
  
function onStateChange(from, registration) {
	return function(e) {
	  	if(e.target.state == 'activated') {
			registerPush(registration);
	  	}
	}
}

function registerPush(register) {
	// console.log("Service Worker Registered...");

	// Register Push
	// console.log("Registering Push...");
	const subscription = register.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
	});

	subscription.then(function(subscription) {
		// console.log("Push Registered...");

		// Send Push Notification
		// console.log("Sending Push...");
		fetch("/subscribe", {
			method: "POST",
			body: JSON.stringify(subscription),
			headers: {
				"content-type": "application/json",
			},
		})
		// .then(function() {
			// console.log("Push Sent...");
		// })
	})
}

async function send() {
	// Register Service Worker
	// console.log("Registering service worker...");

	navigator.serviceWorker.register("/worker.js", {
		scope: "/",
	}).then(onRegistration);

}

function urlBase64ToUint8Array(base64String) {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding)
		.replace(/\-/g, "+")
		.replace(/_/g, "/");

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}


