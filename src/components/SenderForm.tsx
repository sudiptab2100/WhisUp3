import { useForm, SubmitHandler } from "react-hook-form";
import { LightNode } from "@waku/sdk";

type Inputs = {
  to: string;
  message: string;
};

interface Props {
  to: string;
  waku?: LightNode;
  onClickSend: (waku: LightNode, to: string, msg: string) => Promise<boolean>;
}

export default function SenderForm({ to, waku, onClickSend }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    // console.log(data.example)
    // console.log(data.exampleRequired)
    const to = data.to;
    const msg = data.message;
    if(waku) onClickSend(waku, to, msg)
  }

  // console.log(watch("example")); // watch input value by passing the name of it

  return (
    /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* register your input into the hook by invoking the "register" function */}
      <input defaultValue={to} {...register("to")} />

      {/* include validation with required or other standard HTML validation rules */}
      <input {...register("message", { required: true })} />
      {/* errors will return when field validation fails  */}
      {errors.message && <span>This field is required</span>}

      <input type="submit" value="Send"/>
    </form>
  );
}
