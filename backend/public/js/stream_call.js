var apiKey = "47713311";
var sessionId = "1_MX40NzcxMzMxMX5-MTY4NDA3NzY2NTg4OX5GendoUTZqakhsSDViK1dLcWQ5VUdiMlp-fn4";
var token = "T1==cGFydG5lcl9pZD00NzcxMzMxMSZzaWc9MWJjZmJlZjhhNTU0ODJjMDYyOGYxM2JlNTllZGMyMGRjNzFjYmZiMjpzZXNzaW9uX2lkPTFfTVg0ME56Y3hNek14TVg1LU1UWTROREEzTnpZMk5UZzRPWDVHZW5kb1VUWnFha2hzU0RWaUsxZExjV1E1VlVkaU1scC1mbjQmY3JlYXRlX3RpbWU9MTY4NDA3NzY4NSZub25jZT0wLjg0MDg3NzE2NzU1Njc3MzImcm9sZT1wdWJsaXNoZXImZXhwaXJlX3RpbWU9MTY4NDE2NDA4NCZpbml0aWFsX2xheW91dF9jbGFzc19saXN0PQ==";


// Handling all of our errors here by alerting them
function handleError(error) {
    if (error) {
        alert(error.message);
    }
}

// (optional) add server code here
initializeSession();


function initializeSession() {
    var session = OT.initSession(apiKey, sessionId);

    // Subscribe to a newly created stream
    session.on('streamCreated', function(event) {
        session.subscribe(event.stream, 'subscriber', {
            insertMode: 'append',
            width: '100%',
            height: '100%'
        }, handleError);
    });

    // Create a publisher
    var publisher = OT.initPublisher('publisher', {
        insertMode: 'append',
        width: '100%',
        height: '100%'
    }, handleError);

    // Connect to the session
    session.connect(token, function(error) {
      // If the connection is successful, publish to the session
    if (error) {
        handleError(error);
    } else {
        session.publish(publisher, handleError);
    }
    });
}