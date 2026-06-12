import { useNavigate } from "react-router-dom"

import { UBCreatePost } from "@/components/shared/UBCreatePost"

export function CreatePostPage() {
  const navigate = useNavigate()

  return (
    <div className="py-4">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Create Post
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Share announcements, news, or updates with the UB community.
        </p>
      </div>

      <UBCreatePost
        onBack={() => navigate(-1)}
        onSubmit={(values) => {
          console.info("Post submitted", values)
          navigate("/")
        }}
      />
    </div>
  )
}
