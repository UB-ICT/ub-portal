import type { Meta, StoryObj } from "@storybook/react-vite"

import { UBArticleCard } from "./UBArticleCard"

const meta = {
  title: "Components/UBArticleCard",
  component: UBArticleCard,
  args: {
    imageSrc:
      "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=800&q=80",
    imageAlt: "University campus",
    category: "Education",
    categoryVariant: "primary",
    department: "Registrar's Office",
    postedAt: "2 hours ago",
    title: "Fall 2026 Registration Now Open for All Students",
    readTime: "4 min read",
    author: "Luis Herrera",
    likes: 24,
    comments: 7,
    onBookmark: () => undefined,
    onShare: () => undefined,
    onLike: () => undefined,
    href: "#article",
  },
  parameters: {
    docs: {
      description: {
        component:
          "Article card with full-width image, category tag, metadata, engagement and save actions.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof UBArticleCard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
}

export const FinanceCategory: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
  args: {
    imageSrc:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Finance office desk",
    category: "Finance",
    categoryVariant: "secondary",
    department: "Finance Department",
    postedAt: "1 day ago",
    title: "Updated Procurement Guidelines for the 2026-2027 Academic Year",
    readTime: "6 min read",
    author: "Maria Castillo",
    likes: 41,
    comments: 12,
  },
}

export const AlertCategory: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
  args: {
    imageSrc:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Campus notice board",
    category: "Alert",
    categoryVariant: "destructive",
    department: "Student Affairs",
    postedAt: "30 min ago",
    title: "Campus Network Maintenance Scheduled for This Weekend",
    readTime: "2 min read",
    author: "IT Services",
    likes: 5,
    comments: 3,
  },
}

const articles = [
  {
    imageSrc:
      "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=800&q=80",
    imageAlt: "University campus",
    category: "Education",
    categoryVariant: "primary" as const,
    department: "Registrar's Office",
    postedAt: "2 hours ago",
    title: "Fall 2026 Registration Now Open for All Students",
    readTime: "4 min read",
    author: "Luis Herrera",
    likes: 24,
    comments: 7,
    href: "#article-1",
  },
  {
    imageSrc:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Finance office desk",
    category: "Finance",
    categoryVariant: "secondary" as const,
    department: "Finance Department",
    postedAt: "1 day ago",
    title: "Updated Procurement Guidelines for the 2026-2027 Academic Year",
    readTime: "6 min read",
    author: "Maria Castillo",
    likes: 41,
    comments: 12,
    href: "#article-2",
  },
  {
    imageSrc:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Campus graduation",
    category: "Events",
    categoryVariant: "neutral" as const,
    department: "Student Affairs",
    postedAt: "3 days ago",
    title: "2026 Graduation Ceremony Venue and Schedule Announced",
    readTime: "3 min read",
    author: "Events Team",
    likes: 88,
    comments: 29,
    href: "#article-3",
  },
]

export const ArticleGrid: Story = {
  decorators: [
    (Story) => (
      <div className="p-6">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <UBArticleCard
          key={article.href}
          {...article}
          onBookmark={() => undefined}
          onShare={() => undefined}
          onLike={() => undefined}
        />
      ))}
    </div>
  ),
}
