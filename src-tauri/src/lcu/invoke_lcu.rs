use crate::lcu::{process_info, request::build_reqwest_client};

pub struct RESTClient {
    port: String,
    reqwest_client: reqwest::Client,
}

type Error = Box<dyn std::error::Error>;

impl RESTClient {
    /// Create a new instance of the LCU REST wrapper
    pub fn new() -> Result<Self, Error> {
        let (auth_token, port) = process_info::get_auth_info()?;
        let reqwest_client = build_reqwest_client(Some(auth_token));
        Ok(Self {
            port,
            reqwest_client,
        })
    }


    pub async fn get(&self, endpoint: String) -> Result<serde_json::Value, reqwest::Error> {
        let req: serde_json::Value = self
            .reqwest_client
            .get(format!("https://127.0.0.1:{}{}", self.port, endpoint))
            .send()
            .await?
            .json()
            .await?;
        Ok(req)
    }

}
