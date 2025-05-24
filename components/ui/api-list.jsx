import { useOrigin } from "@/hooks/use-origin"
import { useParams } from "next/navigation"
import { ApiAlert } from "@/components/ui/api-alert"

export const ApiList = ({
  entityName,
  entityIdName
}) => {
  const params = useParams()
  const origin = useOrigin()

  const baseUrl = `${origin}/api/${entityName}`

  return (
    <>
      <ApiAlert 
        title="GET" 
        variant="public"
        description={`${baseUrl}`}
      />
      <ApiAlert 
        title="GET" 
        variant="public"
        description={`${baseUrl}/{${entityIdName}}`}
      />
      <ApiAlert 
        title="POST" 
        variant="admin"
        description={`${baseUrl}`}
      />
      <ApiAlert 
        title="PATCH" 
        variant="admin"
        description={`${baseUrl}/{${entityIdName}}`}
      />
      <ApiAlert 
        title="DELETE" 
        variant="admin"
        description={`${baseUrl}/{${entityIdName}}`}
      />
    </>
  )
}
