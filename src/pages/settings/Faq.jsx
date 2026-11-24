import { useState } from "react";
import { App, Button, Collapse, Empty, Form, Input, Modal, Skeleton } from "antd";
import { LuPencil, LuPlus, LuTrash2 } from "react-icons/lu";
import {
  useCreateFaqMutation,
  useDeleteFaqMutation,
  useGetFaqsQuery,
  useUpdateFaqMutation,
} from "../../redux/api/contentApi";
import { getErrorMessage } from "../../redux/api/baseApi";
import { ErrorState, PageHeader, Panel } from "../../components/ui";

export default function Faq() {
  const { message, modal } = App.useApp();
  const { data: faqs = [], isLoading, error, refetch } = useGetFaqsQuery();
  const [createFaq, { isLoading: isCreating }] = useCreateFaqMutation();
  const [updateFaq, { isLoading: isUpdating }] = useUpdateFaqMutation();
  const [deleteFaq] = useDeleteFaqMutation();
  const [editing, setEditing] = useState(null); // null = closed, {} = new, faq = edit
  const [form] = Form.useForm();

  const openEditor = (faq = {}) => setEditing(faq);

  const onSubmit = async ({ question, answer }) => {
    const body = { question: question.trim(), answer: answer.trim() };
    try {
      if (editing?._id) await updateFaq({ id: editing._id, ...body }).unwrap();
      else await createFaq(body).unwrap();
      message.success(editing?._id ? "FAQ updated" : "FAQ added");
      setEditing(null);
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  };

  const confirmDelete = (faq) =>
    modal.confirm({
      title: "Delete this question?",
      content: faq.question,
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteFaq(faq._id).unwrap();
          message.success("FAQ deleted");
        } catch (err) {
          message.error(getErrorMessage(err));
        }
      },
    });

  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;

  return (
    <>
      <PageHeader
        title="FAQ"
        description="Questions and answers shown in the app's help section."
        actions={
          <Button type="primary" icon={<LuPlus />} onClick={() => openEditor()}>
            Add question
          </Button>
        }
      />
      <Panel>
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : faqs.length === 0 ? (
          <Empty description="No questions yet">
            <Button type="primary" onClick={() => openEditor()}>
              Add the first one
            </Button>
          </Empty>
        ) : (
          <Collapse
            bordered={false}
            className="bg-transparent"
            items={faqs.map((faq) => ({
              key: faq._id,
              label: <span className="font-medium">{faq.question}</span>,
              children: <p className="m-0 whitespace-pre-wrap text-ink-muted">{faq.answer}</p>,
              extra: (
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button type="text" size="small" icon={<LuPencil />} onClick={() => openEditor(faq)} aria-label="Edit" />
                  <Button type="text" size="small" danger icon={<LuTrash2 />} onClick={() => confirmDelete(faq)} aria-label="Delete" />
                </div>
              ),
              className: "mb-2 rounded-xl border border-solid border-gray-100 bg-white",
            }))}
          />
        )}
      </Panel>

      <Modal
        open={Boolean(editing)}
        title={editing?._id ? "Edit question" : "New question"}
        okText={editing?._id ? "Save" : "Add"}
        confirmLoading={isCreating || isUpdating}
        onOk={() => form.submit()}
        onCancel={() => setEditing(null)}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={onSubmit}
          preserve={false}
          initialValues={{ question: editing?.question || "", answer: editing?.answer || "" }}
          className="pt-2"
        >
          <Form.Item name="question" label="Question" rules={[{ required: true, whitespace: true, message: "Enter the question" }]}>
            <Input maxLength={200} showCount />
          </Form.Item>
          <Form.Item name="answer" label="Answer" rules={[{ required: true, whitespace: true, message: "Enter the answer" }]}>
            <Input.TextArea rows={6} maxLength={2000} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
