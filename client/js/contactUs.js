document.getElementById("contactForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const message = document.getElementById("message").value;

    // Get the message from customer
  const messageElement = document.getElementById("customerMessage");

 try {
    const response = await fetch("http://localhost:3000/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      messageElement.style.color = "green";
      messageElement.textContent = data.message || "Message sent successfully! Please allow up to 48 hours to get response.";
      // Clear the form after successful submission
      document.getElementById("contactForm").reset();
    } else {
      messageElement.style.color = "red";
      messageElement.textContent = data.message || "Failed to send message. PLease try again.";
    }
  } catch (error) {
    console.error("Contact form error:", error);
    messageElement.style.color = "red";
    messageElement.textContent = "Network error. Please try again.";
  }
});