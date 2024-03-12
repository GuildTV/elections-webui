import 'dotenv/config'

export const webui_port = Number(process.env.WEBUI_PORT) || 8088

export const cvizHost = process.env.CVIZ_HOST || '172.20.0.128'
export const cvizPort = Number(process.env.CVIZ_PORT) || 3456

// export const sabbGraphAddress = "http://172.20.0.136:13370/";
