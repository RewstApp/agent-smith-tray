package msg

import "strings"

func Parse(message string) (string, string) {
	// Check if there is a content
	contentStartIndex := strings.Index(message, ":")

	// No content for the message
	if contentStartIndex == -1 {
		return message, ""
	}

	// Split the type and content
	messageType := message[:contentStartIndex]
	messageContent := message[contentStartIndex+1:]

	return messageType, messageContent
}

type Message struct {
	Type    string `json:"type"`
	Content string `json:"content"`
}
