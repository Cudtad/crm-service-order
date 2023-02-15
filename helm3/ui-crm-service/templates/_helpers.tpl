{{- define "selectorLabels" -}}
app.xdp.vn/name: {{ .Values.appName }}
app.xdp.vn/instance:  {{ .Values.instance }}
{{- end }}

{{- define "labels" -}}
{{ include "selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Values.instance }}
{{- end }}