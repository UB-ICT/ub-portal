import type { Meta, StoryObj } from "@storybook/react-vite"

import { UBCreatePost } from "./UBCreatePost"

const meta = {
  title: "Components/UBCreatePost",
  component: UBCreatePost,
  args: {
    submitLabel: "Publish Post",
    isSubmitting: false,
  },
  parameters: {
    docs: {
      description: {
        component:
          "Create-post form with audience selector, thumbnail upload, category picker, title field, and a rich-text-style body editor. All fields are dynamic and driven by props.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-2xl bg-background px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Create Post
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Share announcements, news, or updates with the UB community.
          </p>
        </div>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof UBCreatePost>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    onBack: () => undefined,
    onSubmit: (values) => console.info("Submitted", values),
  },
}

export const Submitting: Story = {
  args: {
    isSubmitting: true,
    onBack: () => undefined,
  },
}

export const CustomAudiences: Story = {
  args: {
    audiences: [
      { id: "everyone", label: "Everyone" },
      { id: "belmopan", label: "Belmopan Campus" },
      { id: "belize-city", label: "Belize City Campus" },
      { id: "central-farm", label: "Central Farm Campus" },
    ],
    categories: [
      { id: "notice", label: "Notice" },
      { id: "research", label: "Research" },
      { id: "workshop", label: "Workshop" },
    ],
    defaultAudienceId: "belmopan",
    onBack: () => undefined,
    onSubmit: (values) => console.info("Submitted", values),
  },
}
