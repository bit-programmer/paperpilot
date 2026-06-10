import { Body, Button, Column, Container, Heading, Html, Img, Link, Preview, Row, Section, Text, } from 'react-email';


interface VerifyEmailProps {
  companyName: string;
  url: string;
  userName: string;
}

const VerifyEmail = ({
  companyName,
  url,
  userName,
}: VerifyEmailProps) => {
  return (
    <Html>
      <Body className="bg-bg-2 m-0 text-center font-sans">
        <Preview>Verify your email address for {companyName}</Preview>

        <Container className="mobile:mt-0 mx-auto mt-8 w-full max-w-[640px]">
          <Section>
            <Section className="bg-bg mobile:px-2 px-6 py-4">
              {/* Header */}
              <Section className="mb-3 px-6">
                <Row>
                  <Column className="w-1/2 py-[7px] align-middle">
                    <Img
                      src="https://www.saiphex.com/favicon.ico"
                      alt={companyName}
                      width={23}
                    />
                  </Column>

                  <Column align="right" className="w-1/2 py-[7px] align-middle">
                    <Text className="font-13 m-0 text-right">
                      {companyName}
                    </Text>
                  </Column>
                </Row>
              </Section>

              {/* Content */}
              <Section className="bg-bg-2 mobile:px-6 mobile:py-12 rounded-[8px] px-[40px] py-[64px] text-center">
                <Heading as="h1" className="font-28 text-fg m-0">
                  Verify your email address
                </Heading>

                <Text className="font-16 text-fg-2 mx-auto mt-8 mb-8 max-w-[420px]">
                  Hi {userName},
                  <br />
                  <br />
                  Thanks for signing up for {companyName}. To complete your
                  account setup and verify that this email address belongs to
                  you, please click the button below.
                </Text>

                <Section className="mb-6 text-center">
                  <Button
                    href={url}
                    className="bg-fg font-16 text-fg-inverted inline-block rounded-lg px-7 py-4 text-center leading-6"
                  >
                    Verify Email Address
                  </Button>
                </Section>

                <Text className="font-13 text-fg-3 mx-auto mt-8 mb-0 max-w-[420px]">
                  If the button doesn&apos;t work, copy and paste this link into your
                  browser:
                  <br />
                  <br />
                  <Link href={url}>{url}</Link>
                </Text>

                <Text className="font-13 text-fg-3 mx-auto mt-8 mb-0 max-w-[420px]">
                  If you didn&apos;t create an account, you can safely ignore this
                  email.
                </Text>
              </Section>

              {/* Footer */}
              <Section className="bg-bg">
                <Row>
                  <Column className="px-6 py-10 text-center">
                    <Text className="font-11 text-fg-3">
                      © {new Date().getFullYear()} {companyName}. All rights
                      reserved.
                    </Text>
                  </Column>
                </Row>
              </Section>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default VerifyEmail;