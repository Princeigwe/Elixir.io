
const path = window.location.pathname; // <domain/api/v1/stream-call/cipher/key/code>
const parts = path.split('/');
const apiKey = parts[4]; // The cipher value
const sessionId = parts[5]; // The key value
const token = parts[6]; // The code value

console.log(token)

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