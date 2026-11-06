import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import '../styles/editor.css'

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
    [{ align: [] }],
    ['link'],
    ['clean'],
  ],
}

const formats = ['header', 'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block', 'list', 'indent', 'align', 'link']

export default function Editor({ value, onChange, placeholder = 'Tell your story…' }) {
  return (
    <div className="editor-shell">
      <ReactQuill theme="snow" modules={modules} formats={formats} value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  )
}
