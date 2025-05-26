import { SearchX, FileX, Inbox, BookX } from "lucide-react";
import { EmptyPage } from "./empty-page";

/**
 * Examples of how to use the EmptyPage component in different scenarios
 */

export const SearchEmptyExample = () => {
  return (
    <EmptyPage
      icon={<SearchX className="h-12 w-12" />}
      title="No results found"
      description="We couldn't find any results matching your search criteria. Try adjusting your search terms or filters."
      actionLabel="Clear filters"
      onAction={() => console.log("Clear filters clicked")}
    />
  );
};

export const NoContentExample = () => {
  return (
    <EmptyPage
      icon={<FileX className="h-12 w-12" />}
      title="No content yet"
      description="There's no content available in this section yet."
      actionLabel="Create new"
      onAction={() => console.log("Create new clicked")}
    />
  );
};

export const EmptyInboxExample = () => {
  return (
    <EmptyPage
      icon={<Inbox className="h-12 w-12" />}
      title="Your inbox is empty"
      description="You have no new messages or notifications at this time."
    />
  );
};

export const NoCourseExample = () => {
  return (
    <EmptyPage
      icon={<BookX className="h-12 w-12" />}
      title="No courses enrolled"
      description="You haven't enrolled in any courses yet. Browse our catalog to find courses that interest you."
      actionLabel="Browse courses"
      onAction={() => console.log("Browse courses clicked")}
    />
  );
};
