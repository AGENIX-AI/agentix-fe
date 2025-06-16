/**
 * Base interface for all message cards
 */
export interface BaseMessageCard {
  type: string;
  language?: string;
}

/**
 * Topic message card interface
 */
export interface TopicMessageCard extends BaseMessageCard {
  type: "topic";
  topic_name: string;
  topic_goal: string;
  topic_problem: string;
  topic_type: number;
}

/**
 * Type guard to check if a message card is a TopicMessageCard
 */
export function isTopicMessageCard(
  card: BaseMessageCard
): card is TopicMessageCard {
  return card.type === "topic";
}

/**
 * Tutoring topic message card interface
 */
export interface TutoringTopicMessageCard extends BaseMessageCard {
  type: "create_tutoring_topic";
  topics: string;
  goals: string;
  problems: string;
  callback_conversation_id?: string;
  forward_to_conversation_id?: string;
}

/**
 * Type guard to check if a message card is a TutoringTopicMessageCard
 */
export function isTutoringTopicMessageCard(
  card: BaseMessageCard
): card is TutoringTopicMessageCard {
  return card.type === "create_tutoring_topic";
}

/**
 * Learning discuss message card interface
 */
export interface LearningDiscussMessageCard extends BaseMessageCard {
  type: "create_learning_discuss";
  topics: string;
  focus_on: string;
  forward_to_conversation_id?: string;
}

/**
 * Type guard to check if a message card is a LearningDiscussMessageCard
 */
export function isLearningDiscussMessageCard(
  card: BaseMessageCard
): card is LearningDiscussMessageCard {
  return card.type === "create_learning_discuss";
}

/**
 * Learning Topic message card interface
 */
export interface LearningTopicMessageCard extends BaseMessageCard {
  type: "topic";
  topic_name: string;
  focus_on: string;
  topic_type: string;
}

/**
 * Type guard to check if a message card is a LearningTopicMessageCard
 */
export function isLearningTopicMessageCard(
  card: BaseMessageCard
): card is LearningTopicMessageCard {
  return card.type === "topic" && "topic_type" in card && "focus_on" in card;
}

/**
 * Union type of all message card types
 * Add new message card types to this union as they are created
 */
export type MessageCard =
  | TopicMessageCard
  | TutoringTopicMessageCard
  | LearningDiscussMessageCard
  | LearningTopicMessageCard
  | (BaseMessageCard & { type: string });

/**
 * Parse a message string to extract message card data
 * Format: MessageCard|type=value|key=value|...
 */
export function parseMessageCard(content: string): {
  card: MessageCard | null;
  remainingContent: string;
} {
  // Check if the content contains a MessageCard marker
  if (!content.includes("MessageCard|")) {
    return { card: null, remainingContent: content };
  }

  // Extract the message card part
  const parts = content.split("MessageCard|");
  // const beforeCard = parts[0];
  const cardAndAfter = parts[1];

  // Split the remaining content by the first empty line after the card data
  const cardParts = cardAndAfter.split(/\n\s*\n/);
  const cardData = cardParts[0];
  const afterCard = cardParts.slice(1).join("\n\n");

  // Parse the card data
  const cardParams = cardData.split("|");
  const cardObject: Record<string, string> = {};

  cardParams.forEach((param) => {
    const keyValue = param.split("=");
    if (keyValue.length === 2) {
      const [key, value] = keyValue;
      cardObject[key.trim()] = value.trim();
    }
  });

  // Validate the card has a type
  if (!cardObject.type) {
    return { card: null, remainingContent: content };
  }

  return {
    card: cardObject as unknown as MessageCard,
    remainingContent: afterCard,
  };
}
