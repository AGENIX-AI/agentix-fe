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
 * Summary message card interface
 */
export interface SummaryMessageCard extends BaseMessageCard {
  type: "achired_summary";
  content: string;
}

/**
 * Task list message card interface
 */
export interface TaskListCard extends BaseMessageCard {
  type: "task_list";
  title?: string;
  tasks: Array<
    | string
    | {
        id?: string;
        title?: string;
        description?: string;
        done?: boolean;
        [key: string]: any;
      }
  >;
}

/**
 * Type guard to check if a message card is a SummaryMessageCard
 */
export function isSummaryMessageCard(
  card: BaseMessageCard
): card is SummaryMessageCard {
  return card.type === "achired_summary";
}

/**
 * Union type of all message card types
 * Add new message card types to this union as they are created
 */
export type MessageCard =
  | TopicMessageCard
  | TutoringTopicMessageCard
  | SummaryMessageCard
  | TaskListCard
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
  const cardAndAfter = parts[1];

  // For summary cards, handle multiline content differently
  if (cardAndAfter.startsWith("type=achired_summary|content=")) {
    // Find the end marker (====)
    const endMarker = "====";
    const endIndex = cardAndAfter.indexOf(endMarker);

    if (endIndex === -1) {
      // No end marker found, treat rest as card content
      const contentStart = cardAndAfter.indexOf("content=") + "content=".length;
      const cardContent = cardAndAfter.substring(contentStart);

      return {
        card: {
          type: "achired_summary",
          content: cardContent.trim(),
        } as unknown as MessageCard,
        remainingContent: "",
      };
    }

    const cardContent = cardAndAfter.substring(0, endIndex).trim();
    const contentStart = cardContent.indexOf("content=") + "content=".length;
    const actualContent = cardContent.substring(contentStart);

    const afterCard = cardAndAfter
      .substring(endIndex + endMarker.length)
      .trim();

    return {
      card: {
        type: "achired_summary",
        content: actualContent.trim(),
      } as unknown as MessageCard,
      remainingContent: afterCard,
    };
  }

  // Original parsing logic for other card types
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

  // Special handling for task_list: parse JSON-ish tasks and title
  if (cardObject.type === "task_list") {
    const title = cardObject.title;
    let tasks: TaskListCard["tasks"] = [];
    const raw = cardObject.tasks || "[]";
    try {
      // Reverse safe encoding from backend (| -> %7C kept; \n -> newline)
      const normalized = raw.replace(/\\n/g, "\n");
      tasks = JSON.parse(normalized);
    } catch (_) {
      tasks = [];
    }
    return {
      card: { type: "task_list", title, tasks } as unknown as MessageCard,
      remainingContent: afterCard,
    };
  }

  return {
    card: cardObject as unknown as MessageCard,
    remainingContent: afterCard,
  };
}
